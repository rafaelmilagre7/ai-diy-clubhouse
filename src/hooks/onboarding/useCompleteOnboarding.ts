
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth/AuthContext';
import { OnboardingFinalData } from '@/types/onboardingFinal';
import { toast } from '@/hooks/use-toast';

export const useCompleteOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Initialize with proper default values for required fields
  const [data, setData] = useState<OnboardingFinalData>({
    personal_info: {
      name: '',
      email: '',
      whatsapp: '',
      country_code: '+55',
      birth_date: ''
    },
    location_info: {
      country: '',
      state: '',
      city: '',
      instagram_url: '',
      linkedin_url: ''
    },
    discovery_info: {
      how_found_us: '',
      referred_by: ''
    },
    business_info: {
      company_name: '',
      role: '',
      company_size: '',
      company_sector: '',
      company_website: '',
      annual_revenue: '',
      current_position: ''
    },
    business_context: {
      business_model: '',
      business_challenges: [],
      short_term_goals: [],
      medium_term_goals: [],
      important_kpis: [],
      additional_context: ''
    },
    goals_info: {
      primary_goal: '',
      expected_outcomes: [],
      expected_outcome_30days: '',
      priority_solution_type: '',
      how_implement: '',
      week_availability: '',
      content_formats: []
    },
    ai_experience: {
      ai_knowledge_level: '',
      previous_tools: [],
      has_implemented: '',
      desired_ai_areas: [],
      completed_formation: false,
      is_member_for_month: false,
      nps_score: undefined,
      improvement_suggestions: ''
    },
    personalization: {
      interests: [],
      time_preference: [],
      available_days: [],
      networking_availability: undefined,
      skills_to_share: [],
      mentorship_topics: [],
      live_interest: undefined,
      authorize_case_usage: false,
      interested_in_interview: false,
      priority_topics: [],
      content_formats: []
    }
  });

  // Load existing onboarding data
  const loadOnboardingData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      const { data: existingData, error } = await supabase
        .from('onboarding_final')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading onboarding:', error);
        return;
      }

      if (existingData) {
        // Merge existing data with defaults
        setData(prev => ({
          personal_info: { ...prev.personal_info, ...existingData.personal_info },
          location_info: { ...prev.location_info, ...existingData.location_info },
          discovery_info: { ...prev.discovery_info, ...existingData.discovery_info },
          business_info: { ...prev.business_info, ...existingData.business_info },
          business_context: { ...prev.business_context, ...existingData.business_context },
          goals_info: { ...prev.goals_info, ...existingData.goals_info },
          ai_experience: { ...prev.ai_experience, ...existingData.ai_experience },
          personalization: { ...prev.personalization, ...existingData.personalization }
        }));
        
        setCurrentStep(existingData.current_step || 1);
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!user?.id || isSubmitting) return;

    try {
      const { error } = await supabase
        .from('onboarding_final')
        .upsert({
          user_id: user.id,
          personal_info: data.personal_info,
          location_info: data.location_info,
          discovery_info: data.discovery_info,
          business_info: data.business_info,
          business_context: data.business_context,
          goals_info: data.goals_info,
          ai_experience: data.ai_experience,
          personalization: data.personalization,
          current_step: currentStep,
          completed_steps: Array.from({ length: currentStep - 1 }, (_, i) => i + 1),
          is_completed: false
        }, { 
          onConflict: 'user_id' 
        });

      if (error) {
        console.error('Auto-save error:', error);
        return;
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }, [user?.id, data, currentStep, isSubmitting]);

  // Auto-save when data changes
  useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(autoSave, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [data, currentStep, autoSave, isLoading]);

  // Load data on mount
  useEffect(() => {
    loadOnboardingData();
  }, [loadOnboardingData]);

  // Update a specific section
  const updateSection = useCallback((section: keyof OnboardingFinalData, updates: any) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
  }, []);

  // Navigation functions
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Validation functions
  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1: // Personal Info
        const { personal_info } = data;
        return !!(
          personal_info.name?.trim() &&
          personal_info.email?.trim() &&
          personal_info.whatsapp?.trim() &&
          personal_info.country_code?.trim()
        );

      case 2: // Location Info
        const { location_info } = data;
        return !!(
          location_info.country?.trim() &&
          location_info.state?.trim() &&
          location_info.city?.trim()
        );

      case 3: // Discovery Info
        const { discovery_info } = data;
        return !!(discovery_info.how_found_us?.trim());

      case 4: // Business Info
        const { business_info } = data;
        return !!(
          business_info.company_name?.trim() &&
          business_info.role?.trim() &&
          business_info.company_size?.trim() &&
          business_info.company_sector?.trim() &&
          business_info.annual_revenue?.trim()
        );

      case 5: // Business Context
        const { business_context } = data;
        return !!(
          business_context.business_model?.trim() &&
          business_context.business_challenges?.length > 0
        );

      case 6: // Goals Info
        const { goals_info } = data;
        return !!(
          goals_info.primary_goal?.trim() &&
          goals_info.expected_outcome_30days?.trim()
        );

      case 7: // AI Experience
        const { ai_experience } = data;
        return !!(
          ai_experience.ai_knowledge_level?.trim() &&
          ai_experience.has_implemented?.trim()
        );

      case 8: // Personalization
        return true; // This step is optional

      default:
        return false;
    }
  }, [data]);

  const canProceed = validateStep(currentStep);

  // Complete onboarding
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setIsSubmitting(true);

      // Final validation
      for (let step = 1; step <= 7; step++) {
        if (!validateStep(step)) {
          toast({
            title: 'Informações incompletas',
            description: `Por favor, complete todas as informações obrigatórias na etapa ${step}.`,
            variant: 'destructive'
          });
          setCurrentStep(step);
          return false;
        }
      }

      // Save final data
      const { error } = await supabase
        .from('onboarding_final')
        .upsert({
          user_id: user.id,
          personal_info: data.personal_info,
          location_info: data.location_info,
          discovery_info: data.discovery_info,
          business_info: data.business_info,
          business_context: data.business_context,
          goals_info: data.goals_info,
          ai_experience: data.ai_experience,
          personalization: data.personalization,
          current_step: totalSteps,
          completed_steps: Array.from({ length: totalSteps }, (_, i) => i + 1),
          is_completed: true,
          completed_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id' 
        });

      if (error) {
        console.error('Error completing onboarding:', error);
        toast({
          title: 'Erro ao finalizar',
          description: 'Ocorreu um erro ao finalizar seu onboarding. Tente novamente.',
          variant: 'destructive'
        });
        return false;
      }

      toast({
        title: 'Onboarding concluído!',
        description: 'Suas informações foram salvas com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, data, validateStep, totalSteps]);

  return {
    data,
    updateSection,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed,
    currentStep,
    totalSteps,
    isSubmitting,
    isLoading,
    lastSaved
  };
};
