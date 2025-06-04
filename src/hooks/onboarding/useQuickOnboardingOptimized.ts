
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { QuickOnboardingData, ValidationResult, OnboardingStatus } from '@/types/quickOnboarding';
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
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const totalSteps = 4;

  // Helper function to check if a field is properly filled
  const isFilled = (value?: string | null) => !!value?.trim();

  // Normalize data from database
  const normalizeData = (dbData: any): QuickOnboardingData => {
    return {
      name: dbData?.name || '',
      email: dbData?.email || '',
      whatsapp: dbData?.whatsapp || '',
      country_code: dbData?.country_code || '+55',
      birth_date: dbData?.birth_date || '',
      instagram_url: dbData?.instagram_url || '',
      linkedin_url: dbData?.linkedin_url || '',
      how_found_us: dbData?.how_found_us || '',
      referred_by: dbData?.referred_by || '',
      company_name: dbData?.company_name || '',
      role: dbData?.role || '',
      company_size: dbData?.company_size || '',
      company_segment: dbData?.company_segment || '',
      company_website: dbData?.company_website || '',
      annual_revenue_range: dbData?.annual_revenue_range || '',
      main_challenge: dbData?.main_challenge || '',
      ai_knowledge_level: dbData?.ai_knowledge_level || '',
      uses_ai: dbData?.uses_ai || '',
      main_goal: dbData?.main_goal || '',
      desired_ai_areas: Array.isArray(dbData?.desired_ai_areas) ? dbData.desired_ai_areas : [],
      has_implemented: dbData?.has_implemented || '',
      previous_tools: Array.isArray(dbData?.previous_tools) ? dbData.previous_tools : []
    };
  };

  // Load existing data
  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setLoadError(null);

      const { data: onboardingData, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && !error.message.includes('row')) {
        throw error;
      }

      if (onboardingData) {
        const normalizedData = normalizeData(onboardingData);
        setData(normalizedData);
        setHasExistingData(true);
        
        const completedStatus = onboardingData.is_completed === true || onboardingData.is_completed === 'true';
        setIsCompleted(completedStatus);

        // Determine current step based on filled data with proper validation
        if (isFilled(normalizedData.main_goal)) {
          setCurrentStep(4);
        } else if (isFilled(normalizedData.company_name) && isFilled(normalizedData.role)) {
          setCurrentStep(3);
        } else if (isFilled(normalizedData.name) && isFilled(normalizedData.email)) {
          setCurrentStep(2);
        } else {
          setCurrentStep(1);
        }
      } else {
        setCurrentStep(1);
        setIsCompleted(false);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados do onboarding:', error);
      setLoadError(error.message);
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Update field
  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Validate step
  const validateStep = (step: number): ValidationResult => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!isFilled(data.name)) errors.name = 'Nome é obrigatório';
        if (!isFilled(data.email)) errors.email = 'Email é obrigatório';
        if (!isFilled(data.whatsapp)) errors.whatsapp = 'WhatsApp é obrigatório';
        if (!isFilled(data.how_found_us)) errors.how_found_us = 'Como nos conheceu é obrigatório';
        break;
      case 2:
        if (!isFilled(data.company_name)) errors.company_name = 'Nome da empresa é obrigatório';
        if (!isFilled(data.role)) errors.role = 'Cargo é obrigatório';
        if (!isFilled(data.company_size)) errors.company_size = 'Tamanho da empresa é obrigatório';
        if (!isFilled(data.company_segment)) errors.company_segment = 'Segmento é obrigatório';
        break;
      case 3:
        if (!isFilled(data.ai_knowledge_level)) errors.ai_knowledge_level = 'Nível de conhecimento é obrigatório';
        if (!isFilled(data.uses_ai)) errors.uses_ai = 'Uso de IA é obrigatório';
        if (!data.desired_ai_areas.length) errors.desired_ai_areas = 'Selecione ao menos uma área';
        if (!isFilled(data.has_implemented)) errors.has_implemented = 'Implementação anterior é obrigatória';
        break;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Save data
  const saveData = useCallback(async (stepData?: Partial<QuickOnboardingData>) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);
      
      const dataToSave = stepData ? { ...data, ...stepData } : data;
      
      const { error } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          ...dataToSave,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setLastSaveTime(new Date());
      if (stepData) setData(prev => ({ ...prev, ...stepData }));
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar dados:', error);
      toast.error('Erro ao salvar dados');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, data]);

  // Navigation functions
  const nextStep = useCallback(async () => {
    const validation = validateStep(currentStep);
    if (!validation.isValid) {
      toast.error('Complete todos os campos obrigatórios');
      return;
    }

    const saved = await saveData();
    if (saved && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, validateStep, saveData, totalSteps]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('onboarding_progress')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsCompleted(true);
      return true;
    } catch (error: any) {
      console.error('Erro ao completar onboarding:', error);
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
      }
      return false;
    }
  }, [user?.id, retryCount]);

  // Computed properties
  const canProceed = validateStep(currentStep).isValid;
  const canFinalize = currentStep === totalSteps && canProceed;

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    currentStep,
    data,
    updateField,
    nextStep,
    previousStep,
    isLoading,
    hasExistingData,
    loadError,
    totalSteps,
    isSaving,
    lastSaveTime,
    completeOnboarding,
    isCompleted,
    retryCount,
    canProceed,
    canFinalize,
    saveData
  };
};
