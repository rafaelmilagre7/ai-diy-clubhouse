
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { devLog } from '@/utils/devLogging';

const SAVE_DELAY = 2000; // 2 segundos
const MAX_RETRIES = 3;

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [data, setData] = useState<QuickOnboardingData>({
    // Dados pessoais
    name: '',
    email: '',
    whatsapp: '',
    country_code: '',
    birth_date: '',
    instagram_url: '',
    linkedin_url: '',
    how_found_us: '',
    referred_by: '',

    // Dados do negócio
    company_name: '',
    role: '',
    company_size: '',
    company_segment: '',
    company_website: '',
    annual_revenue_range: '',
    main_challenge: '',

    // Experiência com IA
    ai_knowledge_level: '',
    uses_ai: '',
    main_goal: '',

    // Campos adicionais para compatibilidade
    desired_ai_areas: [],
    has_implemented: '',
    previous_tools: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [saveTimeoutId, setSaveTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const totalSteps = 4;

  // Carregar dados existentes
  const loadExistingData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setLoadError(null);

      const { data: existingData, error } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (existingData) {
        setData(existingData);
        setHasExistingData(true);
        
        // Definir step atual baseado nos dados
        if (existingData.main_goal) {
          setCurrentStep(4);
        } else if (existingData.company_name && existingData.role) {
          setCurrentStep(3);
        } else if (existingData.name && existingData.email) {
          setCurrentStep(2);
        } else {
          setCurrentStep(1);
        }

        devLog.info('Dados carregados', { 
          hasData: !!existingData, 
          currentStep: currentStep 
        });
      }
    } catch (error: any) {
      devLog.error('Erro ao carregar dados', error);
      setLoadError(error.message || 'Erro ao carregar dados existentes');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentStep]);

  // Normalizar isCompleted para boolean puro
  const isCompleted = useMemo(() => {
    return data?.isCompleted === true || data?.isCompleted === 'true' ||
           data?.is_completed === true || data?.is_completed === 'true';
  }, [data?.isCompleted, data?.is_completed]);

  // Verificar se pode finalizar
  const canFinalize = useMemo(() => {
    const requiredFields = [
      data.name,
      data.email,
      data.whatsapp,
      data.country_code,
      data.how_found_us,
      data.company_name,
      data.role,
      data.company_size,
      data.company_segment,
      data.annual_revenue_range,
      data.main_challenge,
      data.ai_knowledge_level,
      data.uses_ai,
      data.main_goal
    ];

    return requiredFields.every(field => field && field.toString().trim() !== '');
  }, [data]);

  // Verificar se pode prosseguir para próxima etapa
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return data.name && data.email && data.whatsapp && data.country_code && data.how_found_us;
      case 2:
        return data.company_name && data.role && data.company_size && data.company_segment && data.annual_revenue_range && data.main_challenge;
      case 3:
        return data.ai_knowledge_level && data.uses_ai && data.main_goal;
      case 4:
        return canFinalize;
      default:
        return false;
    }
  }, [currentStep, data, canFinalize]);

  // Salvar dados automaticamente
  const saveData = useCallback(async (dataToSave: QuickOnboardingData) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);
      setRetryCount(0);

      const { error } = await supabase
        .from('quick_onboarding')
        .upsert({
          user_id: user.id,
          ...dataToSave,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setLastSaveTime(Date.now());
      devLog.info('Dados salvos com sucesso');
      return true;
    } catch (error: any) {
      devLog.error('Erro ao salvar dados', error);
      setRetryCount(prev => prev + 1);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id]);

  // Atualizar campo
  const updateField = useCallback((field: keyof QuickOnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));

    // Auto-save com debounce
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      setData(current => {
        saveData(current);
        return current;
      });
    }, SAVE_DELAY);

    setSaveTimeoutId(newTimeoutId);
  }, [saveData, saveTimeoutId]);

  // Navegar para próxima etapa
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps && canProceed) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, canProceed, totalSteps]);

  // Navegar para etapa anterior
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Finalizar onboarding
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !canFinalize) {
      devLog.warn('Tentativa de finalizar onboarding sem dados válidos');
      return false;
    }

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('quick_onboarding')
        .upsert({
          user_id: user.id,
          ...data,
          is_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setLastSaveTime(Date.now());
      devLog.info('Onboarding finalizado com sucesso');
      return true;
    } catch (error: any) {
      devLog.error('Erro ao finalizar onboarding', error);
      setRetryCount(prev => Math.min(prev + 1, MAX_RETRIES));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, data, canFinalize]);

  // Carregar dados na inicialização
  useEffect(() => {
    if (user?.id) {
      loadExistingData();
    }
  }, [user?.id, loadExistingData]);

  useEffect(() => {
    return () => {
      if (saveTimeoutId) {
        clearTimeout(saveTimeoutId);
      }
    };
  }, [saveTimeoutId]);

  return {
    currentStep,
    data,
    updateField,
    nextStep,
    previousStep,
    canProceed,
    isLoading,
    hasExistingData,
    loadError,
    totalSteps,
    isSaving,
    lastSaveTime,
    completeOnboarding,
    isCompleted,
    retryCount,
    canFinalize
  };
};
