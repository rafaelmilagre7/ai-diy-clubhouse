
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingFinalData, CompleteOnboardingResponse } from '@/types/onboardingFinal';
import { toast } from 'sonner';

export const useOnboardingFinalFlow = () => {
  const { user } = useAuth();
  const [data, setData] = useState<OnboardingFinalData>({
    personal_info: {},
    location_info: {},
    discovery_info: {},
    business_info: {},
    business_context: {},
    goals_info: {},
    ai_experience: {},
    personalization: {}
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const totalSteps = 8;
  
  // Use ref to avoid recreating functions unnecessarily
  const validationRef = useRef<Record<string, string>>({});

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        console.log('🔄 Carregando dados do onboarding...');
        
        const { data: existingData, error } = await supabase
          .from('onboarding_final')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Erro ao carregar dados:', error);
        } else if (existingData) {
          console.log('✅ Dados carregados:', existingData);
          setData(existingData);
        }
      } catch (error) {
        console.error('❌ Erro inesperado:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [user?.id]);

  // Validation function - memoized to prevent recreations
  const validateCurrentStep = useMemo(() => {
    const validateStep = (step: number, stepData: OnboardingFinalData): Record<string, string> => {
      const errors: Record<string, string> = {};
      
      switch (step) {
        case 1: // Personal Info
          if (!stepData.personal_info?.name?.trim()) {
            errors.name = 'Nome é obrigatório';
          }
          if (!stepData.personal_info?.email?.trim()) {
            errors.email = 'Email é obrigatório';
          }
          break;
        case 2: // Location Info - optional fields
          break;
        case 3: // Discovery Info - optional fields
          break;
        case 4: // Business Info - optional fields
          break;
        case 5: // Business Context - optional fields
          break;
        case 6: // Goals Info - optional fields
          break;
        case 7: // AI Experience - optional fields
          break;
        case 8: // Personalization - optional fields
          break;
      }
      
      return errors;
    };
    
    return validateStep;
  }, []); // No dependencies to prevent recreations

  // Update validation errors when step or data changes
  useEffect(() => {
    const errors = validateCurrentStep(currentStep, data);
    validationRef.current = errors;
    setValidationErrors(errors);
  }, [currentStep, data, validateCurrentStep]);

  // Can proceed function - stable with useMemo
  const canProceed = useMemo(() => {
    return Object.keys(validationRef.current).length === 0;
  }, [validationErrors]); // Only depends on validationErrors state

  // Update section function - stable with useCallback
  const updateSection = useCallback((section: keyof OnboardingFinalData, updates: any) => {
    console.log(`📝 Atualizando ${section}:`, updates);
    
    setData(prevData => ({
      ...prevData,
      [section]: {
        ...(prevData[section] as object || {}),
        ...updates
      }
    }));
  }, []); // No dependencies needed - uses functional update

  // Navigation functions - stable with useCallback
  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  }, [totalSteps]);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  // Complete onboarding function
  const completeOnboarding = useCallback(async (): Promise<CompleteOnboardingResponse> => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      setIsSubmitting(true);
      console.log('🎯 Finalizando onboarding...');

      // Check if already completed
      const { data: existingData } = await supabase
        .from('onboarding_final')
        .select('is_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingData?.is_completed) {
        console.log('✅ Onboarding já estava completo');
        return { success: true, wasAlreadyCompleted: true };
      }

      // Prepare final data
      const finalData = {
        user_id: user.id,
        ...data,
        is_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('onboarding_final')
        .upsert(finalData, { onConflict: 'user_id' });

      if (error) {
        console.error('❌ Erro ao salvar:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Onboarding finalizado com sucesso!');
      return { success: true };

    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      return { success: false, error: 'Erro inesperado ao finalizar onboarding' };
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, data]);

  return {
    data,
    updateSection,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed: () => canProceed, // Return function to maintain API compatibility
    currentStep,
    totalSteps,
    isSubmitting,
    isLoading,
    validationErrors
  };
};
