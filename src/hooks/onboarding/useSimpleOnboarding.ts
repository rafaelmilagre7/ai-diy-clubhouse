import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { CompleteOnboardingResponse } from '@/types/onboardingFinal';

export interface UseSimpleOnboardingFlowReturn {
  saveProgress: (data: QuickOnboardingData) => Promise<void>;
  completeOnboarding: (data: QuickOnboardingData) => Promise<CompleteOnboardingResponse>;
  isLoading: boolean;
  isSubmitting: boolean;
}

const getInitialData = (): QuickOnboardingData => ({
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
  ai_knowledge_level: 'iniciante',
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
  networking_availability: 5,
  skills_to_share: [],
  mentorship_topics: [],
  live_interest: 0,
  authorize_case_usage: false,
  interested_in_interview: false,
  priority_topics: [],
  currentStep: 1
});

export const useSimpleOnboardingFlow = (): UseSimpleOnboardingFlowReturn => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveProgress = useCallback(async (data: QuickOnboardingData) => {
    if (!user?.id) return;

    try {
      console.log('💾 Salvando progresso do onboarding simples...');
      
      const progressData = {
        user_id: user.id,
        personal_info: {
          name: data.name,
          email: data.email,
          whatsapp: data.whatsapp,
          country_code: data.country_code,
          birth_date: data.birth_date
        },
        discovery_info: {
          how_found_us: data.how_found_us,
          referred_by: data.referred_by
        },
        goals_info: {
          primary_goal: data.primary_goal,
          expected_outcome_30days: data.expected_outcome_30days,
          content_formats: data.content_formats
        },
        is_completed: false,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('onboarding_progress')
        .upsert(progressData, { onConflict: 'user_id' });

      if (error) {
        console.error('❌ Erro ao salvar progresso:', error);
      } else {
        console.log('✅ Progresso salvo com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar progresso:', error);
    }
  }, [user?.id]);

  const completeOnboarding = useCallback(async (data: QuickOnboardingData): Promise<CompleteOnboardingResponse> => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      setIsSubmitting(true);
      console.log('🎯 Finalizando onboarding simples...');

      // Verificar se já foi completado
      const { data: existingData } = await supabase
        .from('onboarding_progress')
        .select('is_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingData?.is_completed) {
        console.log('✅ Onboarding já estava completo');
        return { success: true, wasAlreadyCompleted: true };
      }

      // Preparar dados finais
      const finalData = {
        user_id: user.id,
        personal_info: {
          name: data.name,
          email: data.email,
          whatsapp: data.whatsapp,
          country_code: data.country_code,
          birth_date: data.birth_date
        },
        discovery_info: {
          how_found_us: data.how_found_us,
          referred_by: data.referred_by
        },
        goals_info: {
          primary_goal: data.primary_goal,
          expected_outcome_30days: data.expected_outcome_30days,
          content_formats: data.content_formats
        },
        is_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('onboarding_progress')
        .upsert(finalData, { onConflict: 'user_id' });

      if (error) {
        console.error('❌ Erro ao finalizar onboarding:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Onboarding simples finalizado com sucesso!');
      return { success: true };

    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      return { success: false, error: 'Erro inesperado ao finalizar onboarding' };
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id]);

  return {
    saveProgress,
    completeOnboarding,
    isLoading,
    isSubmitting
  };
};
