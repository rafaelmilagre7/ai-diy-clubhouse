
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
        // Map database fields to component data structure
        const loadedData = {
          ...INITIAL_DATA,
          name: existingData.name || '',
          email: existingData.email || '',
          whatsapp: existingData.whatsapp || '',
          country_code: existingData.country_code || '+55',
          birth_date: existingData.birth_date || '',
          country: existingData.country || '',
          state: existingData.state || '',
          city: existingData.city || '',
          instagram_url: existingData.instagram_url || '',
          linkedin_url: existingData.linkedin_url || '',
          how_found_us: existingData.how_found_us || '',
          referred_by: existingData.referred_by || '',
          company_name: existingData.company_name || '',
          role: existingData.role || '',
          company_size: existingData.company_size || '',
          company_segment: existingData.company_segment || '',
          company_website: existingData.company_website || '',
          annual_revenue_range: existingData.annual_revenue_range || '',
          business_model: existingData.business_model || '',
          business_challenges: existingData.business_challenges || [],
          short_term_goals: existingData.short_term_goals || [],
          medium_term_goals: existingData.medium_term_goals || [],
          important_kpis: existingData.important_kpis || [],
          additional_context: existingData.additional_context || '',
          primary_goal: existingData.primary_goal || '',
          expected_outcomes: existingData.expected_outcomes || [],
          expected_outcome_30days: existingData.expected_outcome_30days || '',
          priority_solution_type: existingData.priority_solution_type || '',
          how_implement: existingData.how_implement || '',
          week_availability: existingData.week_availability || '',
          content_formats: existingData.content_formats || [],
          ai_knowledge_level: existingData.ai_knowledge_level || '',
          previous_tools: existingData.previous_tools || [],
          has_implemented: existingData.has_implemented || '',
          desired_ai_areas: existingData.desired_ai_areas || [],
          completed_formation: existingData.completed_formation || false,
          is_member_for_month: existingData.is_member_for_month || false,
          nps_score: existingData.nps_score || 0,
          improvement_suggestions: existingData.improvement_suggestions || '',
          interests: existingData.interests || [],
          time_preference: existingData.time_preference || [],
          available_days: existingData.available_days || [],
          networking_availability: existingData.networking_availability || 0,
          skills_to_share: existingData.skills_to_share || [],
          mentorship_topics: existingData.mentorship_topics || [],
          live_interest: existingData.live_interest || 0,
          authorize_case_usage: existingData.authorize_case_usage || false,
          interested_in_interview: existingData.interested_in_interview || false,
          priority_topics: existingData.priority_topics || [],
          currentStep: existingData.current_step || 1
        };
        
        setData(loadedData);
        setCurrentStep(existingData.current_step || 1);
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
      
      // Map component data structure to database fields
      const dbData = {
        user_id: user.id,
        name: dataToSave.name,
        email: dataToSave.email,
        whatsapp: dataToSave.whatsapp,
        country_code: dataToSave.country_code,
        birth_date: dataToSave.birth_date || null,
        country: dataToSave.country,
        state: dataToSave.state,
        city: dataToSave.city,
        instagram_url: dataToSave.instagram_url,
        linkedin_url: dataToSave.linkedin_url,
        how_found_us: dataToSave.how_found_us,
        referred_by: dataToSave.referred_by,
        company_name: dataToSave.company_name,
        role: dataToSave.role,
        company_size: dataToSave.company_size,
        company_segment: dataToSave.company_segment,
        company_website: dataToSave.company_website,
        annual_revenue_range: dataToSave.annual_revenue_range,
        business_model: dataToSave.business_model,
        business_challenges: dataToSave.business_challenges,
        short_term_goals: dataToSave.short_term_goals,
        medium_term_goals: dataToSave.medium_term_goals,
        important_kpis: dataToSave.important_kpis,
        additional_context: dataToSave.additional_context,
        primary_goal: dataToSave.primary_goal,
        expected_outcomes: dataToSave.expected_outcomes,
        expected_outcome_30days: dataToSave.expected_outcome_30days,
        priority_solution_type: dataToSave.priority_solution_type,
        how_implement: dataToSave.how_implement,
        week_availability: dataToSave.week_availability,
        content_formats: dataToSave.content_formats,
        ai_knowledge_level: dataToSave.ai_knowledge_level,
        previous_tools: dataToSave.previous_tools,
        has_implemented: dataToSave.has_implemented,
        desired_ai_areas: dataToSave.desired_ai_areas,
        completed_formation: dataToSave.completed_formation,
        is_member_for_month: dataToSave.is_member_for_month,
        nps_score: dataToSave.nps_score,
        improvement_suggestions: dataToSave.improvement_suggestions,
        interests: dataToSave.interests,
        time_preference: dataToSave.time_preference,
        available_days: dataToSave.available_days,
        networking_availability: dataToSave.networking_availability,
        skills_to_share: dataToSave.skills_to_share,
        mentorship_topics: dataToSave.mentorship_topics,
        live_interest: dataToSave.live_interest,
        authorize_case_usage: dataToSave.authorize_case_usage,
        interested_in_interview: dataToSave.interested_in_interview,
        priority_topics: dataToSave.priority_topics,
        current_step: currentStep,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('quick_onboarding_progress')
        .upsert(dbData);

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

      // Save final data with completion flag
      const success = await saveProgress();
      if (!success) return false;

      // Mark onboarding as completed in the database
      const { error: completionError } = await supabase
        .from('quick_onboarding_progress')
        .update({ 
          is_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (completionError) {
        console.error('Error completing onboarding:', completionError);
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
