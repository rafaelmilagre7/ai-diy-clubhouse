
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { toast } from 'sonner';

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingData>({
    name: '',
    email: '',
    whatsapp: '',
    country_code: '+55',
    birth_date: '',
    instagram_url: '',
    linkedin_url: '',
    how_found_us: '',
    referred_by: '',
    company_name: '',
    current_position: '',
    company_sector: '',
    company_size: '',
    annual_revenue: '',
    business_challenges: [],
    primary_goal: '',
    expected_outcomes: [],
    ai_knowledge_level: 1,
    previous_tools: [],
    desired_ai_areas: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Refs para controle interno sem causar re-renders
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCompletingRef = useRef(false);
  const totalSteps = 4;

  // Carregar dados existentes
  const loadExistingData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);

      const { data: existingData, error } = await supabase
        .from('onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (existingData) {
        setHasExistingData(true);
        setIsCompleted(existingData.is_completed || false);
        
        // Mapear dados existentes para o estado
        setData({
          name: existingData.name || '',
          email: existingData.email || '',
          whatsapp: existingData.phone || '',
          country_code: existingData.ddi || '+55',
          birth_date: existingData.birth_date || '',
          instagram_url: existingData.instagram || '',
          linkedin_url: existingData.linkedin || '',
          how_found_us: existingData.how_found_us || '',
          referred_by: existingData.referred_by || '',
          company_name: existingData.company_name || '',
          current_position: existingData.current_position || '',
          company_sector: existingData.company_sector || '',
          company_size: existingData.company_size || '',
          annual_revenue: existingData.annual_revenue || '',
          business_challenges: existingData.business_challenges || [],
          primary_goal: existingData.primary_goal || '',
          expected_outcomes: existingData.expected_outcomes || [],
          ai_knowledge_level: existingData.knowledge_level ? 
            (existingData.knowledge_level === 'beginner' ? 1 : 
             existingData.knowledge_level === 'intermediate' ? 2 : 3) : 1,
          previous_tools: existingData.previous_tools || [],
          desired_ai_areas: existingData.desired_ai_areas || []
        });

        // Determinar step atual baseado nos dados
        if (existingData.is_completed) {
          setCurrentStep(4);
        } else if (existingData.current_step) {
          const stepMap: Record<string, number> = {
            'personal': 1,
            'business': 2,
            'ai_experience': 3,
            'finalization': 4
          };
          setCurrentStep(stepMap[existingData.current_step] || 1);
        } else {
          // Determinar step baseado em dados preenchidos
          if (data.name && data.email && data.whatsapp) {
            if (data.company_name && data.current_position) {
              if (data.ai_knowledge_level && data.primary_goal) {
                setCurrentStep(4);
              } else {
                setCurrentStep(3);
              }
            } else {
              setCurrentStep(2);
            }
          } else {
            setCurrentStep(1);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoadError('Não foi possível carregar seus dados anteriores');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Auto-save otimizado
  const saveData = useCallback(async (dataToSave: QuickOnboardingData) => {
    if (!user?.id || isSaving) return;

    try {
      setIsSaving(true);

      const stepMap: Record<number, string> = {
        1: 'personal',
        2: 'business', 
        3: 'ai_experience',
        4: 'finalization'
      };

      const savePayload = {
        user_id: user.id,
        name: dataToSave.name,
        email: dataToSave.email,
        phone: dataToSave.whatsapp,
        ddi: dataToSave.country_code,
        birth_date: dataToSave.birth_date,
        instagram: dataToSave.instagram_url,
        linkedin: dataToSave.linkedin_url,
        how_found_us: dataToSave.how_found_us,
        referred_by: dataToSave.referred_by,
        company_name: dataToSave.company_name,
        current_position: dataToSave.current_position,
        company_sector: dataToSave.company_sector,
        company_size: dataToSave.company_size,
        annual_revenue: dataToSave.annual_revenue,
        business_challenges: dataToSave.business_challenges,
        primary_goal: dataToSave.primary_goal,
        expected_outcomes: dataToSave.expected_outcomes,
        knowledge_level: dataToSave.ai_knowledge_level === 1 ? 'beginner' :
                        dataToSave.ai_knowledge_level === 2 ? 'intermediate' : 'advanced',
        previous_tools: dataToSave.previous_tools,
        desired_ai_areas: dataToSave.desired_ai_areas,
        current_step: stepMap[currentStep],
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('onboarding')
        .upsert(savePayload);

      if (error) throw error;

      setLastSaveTime(Date.now());
      setHasExistingData(true);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, currentStep, isSaving]);

  // Update field com debounce
  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));

    // Clear timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Auto-save com debounce
    saveTimeoutRef.current = setTimeout(() => {
      setData(currentData => {
        saveData({ ...currentData, [field]: value });
        return { ...currentData, [field]: value };
      });
    }, 1000);
  }, [saveData]);

  // Validação de step
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return !!(data.name && data.email && data.whatsapp && data.how_found_us);
      case 2:
        return !!(data.company_name && data.current_position && data.company_sector);
      case 3:
        return !!(data.ai_knowledge_level && data.primary_goal);
      case 4:
        return canFinalize();
      default:
        return false;
    }
  }, [currentStep, data]);

  // Validação para finalização
  const canFinalize = useCallback(() => {
    const requiredFields = [
      data.name,
      data.email, 
      data.whatsapp,
      data.how_found_us,
      data.company_name,
      data.current_position,
      data.company_sector,
      data.primary_goal
    ];
    
    return requiredFields.every(field => field && field.trim() !== '') && 
           data.ai_knowledge_level > 0;
  }, [data]);

  // Navegação entre steps
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps && canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, canProceed]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Finalizar onboarding
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (isCompletingRef.current || !canFinalize()) {
      return false;
    }

    isCompletingRef.current = true;
    
    try {
      // Salvar dados finais
      await saveData(data);
      
      // Marcar como concluído
      const { error } = await supabase
        .from('onboarding')
        .update({ 
          is_completed: true,
          current_step: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      setIsCompleted(true);
      setRetryCount(0);
      return true;
    } catch (error) {
      console.error('Erro ao finalizar onboarding:', error);
      setRetryCount(prev => prev + 1);
      return false;
    } finally {
      isCompletingRef.current = false;
    }
  }, [canFinalize, saveData, data, user?.id]);

  // Carregar dados na inicialização
  useEffect(() => {
    loadExistingData();
  }, [loadExistingData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentStep,
    setCurrentStep,
    data,
    updateField,
    nextStep,
    previousStep,
    canProceed: canProceed(),
    isLoading,
    hasExistingData,
    loadError,
    totalSteps,
    isSaving,
    lastSaveTime,
    completeOnboarding,
    isCompleted,
    retryCount,
    canFinalize: canFinalize()
  };
};
