import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { QuickOnboardingData, ValidationResult, OnboardingStatus } from '@/types/quickOnboarding';
import { toast } from 'sonner';

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingData>({
    personal_info: {
      name: '',
      email: '',
      whatsapp: '',
      country_code: '+55',
      birth_date: '',
      instagram_url: '',
      linkedin_url: '',
      how_found_us: '',
      referred_by: ''
    },
    professional_info: {
      company_name: '',
      role: '',
      company_size: '',
      company_segment: '',
      company_website: '',
      annual_revenue_range: '',
      main_challenge: ''
    },
    ai_experience: {
      ai_knowledge_level: '',
      uses_ai: '',
      main_goal: '',
      desired_ai_areas: [],
      has_implemented: '',
      previous_tools: []
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);

  const totalSteps = 4;

  // Helper function to check if a field is properly filled
  const isFilled = (value?: string | null) => !!value?.trim();

  // Helper function to check if array has items
  const hasItems = (arr?: any[]) => Array.isArray(arr) && arr.length > 0;

  // Normalize data from database to structured format
  const normalizeData = (dbData: any): QuickOnboardingData => {
    return {
      personal_info: {
        name: dbData?.name || dbData?.personal_info?.name || '',
        email: dbData?.email || dbData?.personal_info?.email || '',
        whatsapp: dbData?.whatsapp || dbData?.personal_info?.whatsapp || '',
        country_code: dbData?.country_code || dbData?.personal_info?.country_code || '+55',
        birth_date: dbData?.birth_date || dbData?.personal_info?.birth_date || '',
        instagram_url: dbData?.instagram_url || dbData?.personal_info?.instagram_url || '',
        linkedin_url: dbData?.linkedin_url || dbData?.personal_info?.linkedin_url || '',
        how_found_us: dbData?.how_found_us || dbData?.personal_info?.how_found_us || '',
        referred_by: dbData?.referred_by || dbData?.personal_info?.referred_by || ''
      },
      professional_info: {
        company_name: dbData?.company_name || dbData?.professional_info?.company_name || '',
        role: dbData?.role || dbData?.professional_info?.role || '',
        company_size: dbData?.company_size || dbData?.professional_info?.company_size || '',
        company_segment: dbData?.company_segment || dbData?.professional_info?.company_segment || '',
        company_website: dbData?.company_website || dbData?.professional_info?.company_website || '',
        annual_revenue_range: dbData?.annual_revenue_range || dbData?.professional_info?.annual_revenue_range || '',
        main_challenge: dbData?.main_challenge || dbData?.professional_info?.main_challenge || ''
      },
      ai_experience: {
        ai_knowledge_level: dbData?.ai_knowledge_level || dbData?.ai_experience?.ai_knowledge_level || '',
        uses_ai: dbData?.uses_ai || dbData?.ai_experience?.uses_ai || '',
        main_goal: dbData?.main_goal || dbData?.ai_experience?.main_goal || '',
        desired_ai_areas: dbData?.desired_ai_areas || dbData?.ai_experience?.desired_ai_areas || [],
        has_implemented: dbData?.has_implemented || dbData?.ai_experience?.has_implemented || '',
        previous_tools: dbData?.previous_tools || dbData?.ai_experience?.previous_tools || []
      }
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
        const personalComplete = isFilled(normalizedData.personal_info.name) && 
                                isFilled(normalizedData.personal_info.email) &&
                                isFilled(normalizedData.personal_info.how_found_us);
        
        const professionalComplete = isFilled(normalizedData.professional_info.company_name) && 
                                    isFilled(normalizedData.professional_info.role) &&
                                    isFilled(normalizedData.professional_info.company_size);
        
        const aiComplete = isFilled(normalizedData.ai_experience.ai_knowledge_level) &&
                          isFilled(normalizedData.ai_experience.main_goal) &&
                          hasItems(normalizedData.ai_experience.desired_ai_areas);

        if (aiComplete && professionalComplete && personalComplete) {
          setCurrentStep(4);
        } else if (professionalComplete && personalComplete) {
          setCurrentStep(3);
        } else if (personalComplete) {
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

  // Update field with structured approach
  const updateField = useCallback((field: string, value: any) => {
    setData(prev => {
      const newData = { ...prev };
      
      // Handle nested field updates
      if (field.includes('.')) {
        const [section, subField] = field.split('.');
        if (section === 'personal_info' || section === 'professional_info' || section === 'ai_experience') {
          newData[section] = {
            ...newData[section],
            [subField]: value
          };
        }
      } else {
        // Handle direct field updates for backward compatibility
        const legacyField = field as keyof QuickOnboardingData;
        (newData as any)[legacyField] = value;
      }
      
      return newData;
    });
  }, []);

  // Validate step with structured data
  const validateStep = (step: number): ValidationResult => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!isFilled(data.personal_info.name)) errors['personal_info.name'] = 'Nome é obrigatório';
        if (!isFilled(data.personal_info.email)) errors['personal_info.email'] = 'Email é obrigatório';
        if (!isFilled(data.personal_info.whatsapp)) errors['personal_info.whatsapp'] = 'WhatsApp é obrigatório';
        if (!isFilled(data.personal_info.how_found_us)) errors['personal_info.how_found_us'] = 'Como nos conheceu é obrigatório';
        break;
      case 2:
        if (!isFilled(data.professional_info.company_name)) errors['professional_info.company_name'] = 'Nome da empresa é obrigatório';
        if (!isFilled(data.professional_info.role)) errors['professional_info.role'] = 'Cargo é obrigatório';
        if (!isFilled(data.professional_info.company_size)) errors['professional_info.company_size'] = 'Tamanho da empresa é obrigatório';
        if (!isFilled(data.professional_info.company_segment)) errors['professional_info.company_segment'] = 'Segmento é obrigatório';
        break;
      case 3:
        if (!isFilled(data.ai_experience.ai_knowledge_level)) errors['ai_experience.ai_knowledge_level'] = 'Nível de conhecimento é obrigatório';
        if (!isFilled(data.ai_experience.uses_ai)) errors['ai_experience.uses_ai'] = 'Uso de IA é obrigatório';
        if (!hasItems(data.ai_experience.desired_ai_areas)) errors['ai_experience.desired_ai_areas'] = 'Selecione ao menos uma área';
        if (!isFilled(data.ai_experience.has_implemented)) errors['ai_experience.has_implemented'] = 'Implementação anterior é obrigatória';
        break;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Save data with structured format
  const saveData = useCallback(async (stepData?: Partial<QuickOnboardingData>) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);
      
      const dataToSave = stepData ? { ...data, ...stepData } : data;
      
      // Flatten data for database storage while maintaining structure
      const flattenedData = {
        // Keep structured data
        personal_info: dataToSave.personal_info,
        professional_info: dataToSave.professional_info,
        ai_experience: dataToSave.ai_experience,
        
        // Keep flat fields for compatibility
        name: dataToSave.personal_info.name,
        email: dataToSave.personal_info.email,
        whatsapp: dataToSave.personal_info.whatsapp,
        company_name: dataToSave.professional_info.company_name,
        role: dataToSave.professional_info.role,
        main_goal: dataToSave.ai_experience.main_goal,
        desired_ai_areas: dataToSave.ai_experience.desired_ai_areas
      };
      
      const { error } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          ...flattenedData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setLastSaveTime(Date.now());
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
