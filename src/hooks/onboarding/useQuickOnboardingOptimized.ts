
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { QuickOnboardingData, OnboardingStatus, ValidationResult } from '@/types/quickOnboarding';
import { devLog } from '@/utils/devLogging';

const SAVE_DELAY = 2000;
const MAX_RETRIES = 3;

const INITIAL_DATA: QuickOnboardingData = {
  name: '',
  email: '',
  whatsapp: '',
  country_code: '',
  birth_date: '',
  instagram_url: '',
  linkedin_url: '',
  how_found_us: '',
  referred_by: '',
  company_name: '',
  role: '',
  company_size: '',
  company_segment: '',
  company_website: '',
  annual_revenue_range: '',
  main_challenge: '',
  ai_knowledge_level: '',
  uses_ai: '',
  main_goal: '',
  desired_ai_areas: [],
  has_implemented: '',
  previous_tools: []
};

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [data, setData] = useState<QuickOnboardingData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [saveTimeoutId, setSaveTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [backendCompleted, setBackendCompleted] = useState<boolean>(false);

  const totalSteps = 4;

  // Validação por etapa
  const validateStep = useCallback((step: number, stepData: QuickOnboardingData): ValidationResult => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!stepData.name?.trim()) errors.name = 'Nome é obrigatório';
        if (!stepData.email?.trim()) errors.email = 'E-mail é obrigatório';
        if (!stepData.whatsapp?.trim()) errors.whatsapp = 'WhatsApp é obrigatório';
        if (!stepData.country_code?.trim()) errors.country_code = 'País é obrigatório';
        if (!stepData.how_found_us?.trim()) errors.how_found_us = 'Como conheceu é obrigatório';
        break;
      
      case 2:
        if (!stepData.company_name?.trim()) errors.company_name = 'Nome da empresa é obrigatório';
        if (!stepData.role?.trim()) errors.role = 'Cargo é obrigatório';
        if (!stepData.company_size?.trim()) errors.company_size = 'Tamanho da empresa é obrigatório';
        if (!stepData.company_segment?.trim()) errors.company_segment = 'Segmento é obrigatório';
        if (!stepData.annual_revenue_range?.trim()) errors.annual_revenue_range = 'Faturamento é obrigatório';
        if (!stepData.main_challenge?.trim()) errors.main_challenge = 'Principal desafio é obrigatório';
        break;
      
      case 3:
        if (!stepData.ai_knowledge_level?.trim()) errors.ai_knowledge_level = 'Nível de conhecimento é obrigatório';
        if (!stepData.uses_ai?.trim()) errors.uses_ai = 'Uso de IA é obrigatório';
        if (!stepData.main_goal?.trim()) errors.main_goal = 'Principal objetivo é obrigatório';
        break;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  // Status calculado
  const status = useMemo((): OnboardingStatus => {
    const currentStepValidation = validateStep(currentStep, data);
    const allStepsValidation = validateStep(1, data).isValid && 
                              validateStep(2, data).isValid && 
                              validateStep(3, data).isValid;

    return {
      isCompleted: backendCompleted,
      currentStep,
      canProceed: currentStepValidation.isValid,
      canFinalize: allStepsValidation && !backendCompleted
    };
  }, [currentStep, data, backendCompleted, validateStep]);

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
        // Normalizar dados carregados
        const normalizedData: QuickOnboardingData = {
          ...INITIAL_DATA,
          ...existingData,
          desired_ai_areas: existingData.desired_ai_areas || [],
          previous_tools: existingData.previous_tools || []
        };

        setData(normalizedData);
        setHasExistingData(true);
        
        // Verificar se está completo no backend
        const completed = existingData.is_completed === true || existingData.is_completed === 'true';
        setBackendCompleted(completed);
        
        // Definir step baseado no progresso
        if (completed) {
          setCurrentStep(4);
        } else if (normalizedData.main_goal) {
          setCurrentStep(4);
        } else if (normalizedData.company_name && normalizedData.role) {
          setCurrentStep(3);
        } else if (normalizedData.name && normalizedData.email) {
          setCurrentStep(2);
        } else {
          setCurrentStep(1);
        }

        devLog.info('Dados carregados com sucesso', { 
          hasData: true, 
          isCompleted: completed,
          currentStep 
        });
      }
    } catch (error: any) {
      devLog.error('Erro ao carregar dados', error);
      setLoadError(error.message || 'Erro ao carregar dados existentes');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentStep]);

  // Salvar dados
  const saveData = useCallback(async (dataToSave: QuickOnboardingData): Promise<boolean> => {
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

  // Atualizar campo com auto-save
  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
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

  // Navegação
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps && status.canProceed) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, status.canProceed, totalSteps]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Finalizar onboarding
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !status.canFinalize) {
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

      setBackendCompleted(true);
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
  }, [user?.id, data, status.canFinalize]);

  // Carregar dados na inicialização
  useEffect(() => {
    if (user?.id) {
      loadExistingData();
    }
  }, [user?.id, loadExistingData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutId) {
        clearTimeout(saveTimeoutId);
      }
    };
  }, [saveTimeoutId]);

  return {
    // Dados e status
    data,
    currentStep,
    totalSteps,
    isLoading,
    hasExistingData,
    loadError,
    
    // Status computado (sempre boolean limpo)
    isCompleted: status.isCompleted,
    canProceed: status.canProceed,
    canFinalize: status.canFinalize,
    
    // Operações
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    
    // Feedback
    isSaving,
    lastSaveTime,
    retryCount,
    
    // Validação
    validateStep: (step: number) => validateStep(step, data)
  };
};
