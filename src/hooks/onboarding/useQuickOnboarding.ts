
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { QuickOnboardingData } from '@/types/quickOnboarding';

const getInitialData = (): QuickOnboardingData => ({
  name: '',
  email: '',
  whatsapp: '',
  country_code: '+55',
  birth_date: '',
  country: '',
  state: '',
  city: '',
  timezone: '',
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
  ai_knowledge_level: '1',
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
  currentStep: '1'
});

export const useQuickOnboarding = () => {
  const { user } = useAuth();
  const [data, setData] = useState<QuickOnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados salvos
  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data: savedData, error: fetchError } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erro ao carregar dados:', fetchError);
        setError('Erro ao carregar dados salvos');
        return;
      }

      if (savedData) {
        console.log('📥 Dados carregados do banco:', savedData);
        setData(savedData);
      } else {
        console.log('📝 Inicializando com dados padrão');
        setData(getInitialData());
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar dados:', err);
      setError('Erro inesperado');
      setData(getInitialData());
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Completar onboarding
  const completeOnboarding = useCallback(async (onboardingData: QuickOnboardingData): Promise<boolean> => {
    if (!user?.id) {
      console.error('❌ Usuário não autenticado');
      return false;
    }

    try {
      console.log('🏁 Completando onboarding...', onboardingData);

      // Marcar como completo
      const dataToSave = {
        ...onboardingData,
        user_id: user.id,
        is_completed: true,
        completed_at: new Date().toISOString()
      };

      const { error: saveError } = await supabase
        .from('quick_onboarding')
        .upsert(dataToSave, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (saveError) {
        console.error('❌ Erro ao completar onboarding:', saveError);
        toast.error('Erro ao finalizar onboarding');
        return false;
      }

      console.log('✅ Onboarding completado com sucesso');
      toast.success('Onboarding completado com sucesso! 🎉');
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado ao completar onboarding:', error);
      toast.error('Erro inesperado ao finalizar');
      return false;
    }
  }, [user?.id]);

  // Carregar dados na inicialização
  useState(() => {
    if (user?.id && !data) {
      loadData();
    }
  });

  return {
    data,
    isLoading,
    error,
    completeOnboarding,
    loadData
  };
};
