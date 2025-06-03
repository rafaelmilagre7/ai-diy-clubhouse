
import { useState, useCallback, useEffect } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

const INITIAL_DATA: QuickOnboardingData = {
  name: '',
  email: '',
  whatsapp: '',
  country_code: '+55',
  birth_date: '',
  country: '',
  state: '',
  city: '',
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
  current_position: '',
  business_model: '',
  business_challenges: [],
  short_term_goals: [],
  medium_term_goals: [],
  important_kpis: [],
  additional_context: '',
  primary_goal: '',
  expected_outcomes: [],
  expected_outcome_30days: '',
  priority_solution_type: '',
  how_implement: '',
  week_availability: '',
  content_formats: [],
  ai_knowledge_level: '',
  previous_tools: [],
  has_implemented: '',
  desired_ai_areas: [],
  completed_formation: false,
  is_member_for_month: false,
  nps_score: 0,
  improvement_suggestions: '',
  interests: [],
  time_preference: [],
  available_days: [],
  networking_availability: 0,
  skills_to_share: [],
  mentorship_topics: [],
  live_interest: 0,
  authorize_case_usage: false,
  interested_in_interview: false,
  priority_topics: [],
  currentStep: 1
};

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const [data, setData] = useState<QuickOnboardingData>(INITIAL_DATA);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const totalSteps = 8;

  // Load existing data on mount
  useEffect(() => {
    if (user?.id) {
      loadExistingData();
    }
  }, [user?.id]);

  const loadExistingData = async () => {
    try {
      setIsLoading(true);
      
      const { data: existingData, error } = await supabase
        .from('quick_onboarding_progress')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading onboarding data:', error);
        return;
      }

      if (existingData) {
        const loadedData = {
          ...INITIAL_DATA,
          ...existingData,
          currentStep: existingData.currentStep || 1
        };
        setData(loadedData);
        setCurrentStep(existingData.currentStep || 1);
      }
    } catch (error) {
      console.error('Error in loadExistingData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = useCallback((field: keyof QuickOnboardingData, value: string | string[] | number | boolean) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const saveProgress = async (stepData?: Partial<QuickOnboardingData>) => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);
      
      const dataToSave = stepData ? { ...data, ...stepData } : data;
      
      const { error } = await supabase
        .from('quick_onboarding_progress')
        .upsert({
          user_id: user.id,
          ...dataToSave,
          currentStep: currentStep,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving progress:', error);
        return false;
      }

      if (stepData) {
        setData(prev => ({ ...prev, ...stepData }));
      }

      return true;
    } catch (error) {
      console.error('Error in saveProgress:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = async () => {
    const success = await saveProgress({ currentStep: currentStep + 1 });
    if (success && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      saveProgress({ currentStep: currentStep - 1 });
    }
  };

  const completeOnboarding = async () => {
    if (!user?.id) return false;

    try {
      setIsCompleting(true);

      // Save final data
      const success = await saveProgress();
      if (!success) return false;

      // Mark onboarding as completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return false;
    } finally {
      setIsCompleting(false);
    }
  };

  // Validation logic for each step
  const getStepValidation = (step: number) => {
    switch (step) {
      case 1:
        return !!(data.name && data.email && data.whatsapp && data.country_code);
      case 2:
        return !!(data.country && data.state && data.city);
      case 3:
        return !!data.how_found_us;
      case 4:
        return !!(data.company_name && data.role && data.company_size && data.company_segment);
      case 5:
        return !!(data.business_model && data.business_challenges && data.business_challenges.length > 0);
      case 6:
        return !!(data.primary_goal && data.expected_outcome_30days);
      case 7:
        return !!(data.ai_knowledge_level && data.has_implemented);
      case 8:
        return true; // Personalização é opcional
      default:
        return false;
    }
  };

  const canProceed = getStepValidation(currentStep);

  return {
    data,
    currentStep,
    totalSteps,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed,
    isSaving,
    isCompleting,
    isLoading,
    saveProgress
  };
};
