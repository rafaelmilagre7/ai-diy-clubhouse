
import { useState, useEffect } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

const initialData: QuickOnboardingData = {
  // Etapa 1: Informações Pessoais Básicas
  name: '',
  email: '',
  whatsapp: '',
  country_code: '+55',
  birth_date: '',
  
  // Etapa 2: Localização e Redes Sociais
  country: '',
  state: '',
  city: '',
  timezone: '',
  instagram_url: '',
  linkedin_url: '',
  
  // Etapa 3: Como nos conheceu
  how_found_us: '',
  referred_by: '',
  
  // Etapa 4: Informações Profissionais
  company_name: '',
  role: '',
  company_size: '',
  company_segment: '',
  company_website: '',
  annual_revenue_range: '',
  current_position: '',
  
  // Etapa 5: Contexto do Negócio
  business_model: '',
  main_challenge: '',
  business_challenges: [],
  short_term_goals: [],
  medium_term_goals: [],
  important_kpis: [],
  additional_context: '',
  
  // Etapa 6: Objetivos e Metas
  main_goal: '',
  primary_goal: '',
  expected_outcomes: [],
  expected_outcome_30days: '',
  priority_solution_type: '',
  how_implement: '',
  week_availability: '',
  content_formats: [],
  
  // Etapa 7: Experiência com IA
  ai_knowledge_level: '',
  uses_ai: '',
  previous_tools: [],
  has_implemented: '',
  desired_ai_areas: [],
  completed_formation: false,
  is_member_for_month: false,
  nps_score: 0,
  improvement_suggestions: '',
  
  // Etapa 8: Personalização da Experiência
  interests: [],
  time_preference: [],
  available_days: [],
  networking_availability: 0,
  skills_to_share: [],
  mentorship_topics: [],
  
  // Campos de controle
  live_interest: 0,
  authorize_case_usage: false,
  interested_in_interview: false,
  priority_topics: []
};

export const useQuickOnboardingDataLoader = () => {
  const { user } = useAuth();
  const [data, setData] = useState<QuickOnboardingData>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadExistingData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔄 Carregando dados existentes do onboarding...');
        
        // Buscar dados na tabela onboarding_progress (estrutura mais completa)
        const { data: progressData, error: progressError } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (progressData && !progressError) {
          console.log('✅ Dados encontrados na onboarding_progress:', progressData);
          
          // Mapear dados completos da estrutura JSONB
          setData({
            // Informações pessoais
            name: progressData.personal_info?.name || user.user_metadata?.name || '',
            email: progressData.personal_info?.email || user.email || '',
            whatsapp: progressData.personal_info?.phone || '',
            country_code: progressData.personal_info?.ddi || '+55',
            birth_date: progressData.personal_info?.birth_date || '',
            country: progressData.personal_info?.country || '',
            state: progressData.personal_info?.state || '',
            city: progressData.personal_info?.city || '',
            timezone: progressData.personal_info?.timezone || '',
            instagram_url: progressData.personal_info?.instagram || '',
            linkedin_url: progressData.personal_info?.linkedin || '',
            
            // Como nos conheceu
            how_found_us: progressData.complementary_info?.how_found_us || '',
            referred_by: progressData.complementary_info?.referred_by || '',
            
            // Informações profissionais
            company_name: progressData.professional_info?.company_name || progressData.company_name || '',
            role: progressData.professional_info?.current_position || progressData.current_position || '',
            company_size: progressData.professional_info?.company_size || progressData.company_size || '',
            company_segment: progressData.professional_info?.company_sector || progressData.company_sector || '',
            company_website: progressData.professional_info?.company_website || progressData.company_website || '',
            annual_revenue_range: progressData.professional_info?.annual_revenue || progressData.annual_revenue || '',
            current_position: progressData.professional_info?.current_position || progressData.current_position || '',
            
            // Contexto do negócio
            business_model: progressData.business_context?.business_model || '',
            main_challenge: progressData.business_context?.business_challenges?.[0] || '',
            business_challenges: progressData.business_context?.business_challenges || [],
            short_term_goals: progressData.business_context?.short_term_goals || [],
            medium_term_goals: progressData.business_context?.medium_term_goals || [],
            important_kpis: progressData.business_context?.important_kpis || [],
            additional_context: progressData.business_context?.additional_context || '',
            
            // Objetivos e metas
            main_goal: progressData.business_goals?.primary_goal || '',
            primary_goal: progressData.business_goals?.primary_goal || '',
            expected_outcomes: progressData.business_goals?.expected_outcomes || [],
            expected_outcome_30days: progressData.business_goals?.expected_outcome_30days || '',
            priority_solution_type: progressData.business_goals?.priority_solution_type || '',
            how_implement: progressData.business_goals?.how_implement || '',
            week_availability: progressData.business_goals?.week_availability || '',
            content_formats: progressData.business_goals?.content_formats || [],
            
            // Experiência com IA
            ai_knowledge_level: progressData.ai_experience?.knowledge_level || '',
            uses_ai: progressData.ai_experience?.has_implemented || '',
            previous_tools: progressData.ai_experience?.previous_tools || [],
            has_implemented: progressData.ai_experience?.has_implemented || '',
            desired_ai_areas: progressData.ai_experience?.desired_ai_areas || [],
            completed_formation: progressData.ai_experience?.completed_formation || false,
            is_member_for_month: progressData.ai_experience?.is_member_for_month || false,
            nps_score: progressData.ai_experience?.nps_score || 0,
            improvement_suggestions: progressData.ai_experience?.improvement_suggestions || '',
            
            // Personalização da experiência
            interests: progressData.experience_personalization?.interests || [],
            time_preference: progressData.experience_personalization?.time_preference || [],
            available_days: progressData.experience_personalization?.available_days || [],
            networking_availability: progressData.experience_personalization?.networking_availability || 0,
            skills_to_share: progressData.experience_personalization?.skills_to_share || [],
            mentorship_topics: progressData.experience_personalization?.mentorship_topics || [],
            
            // Campos de controle
            live_interest: progressData.business_goals?.live_interest || 0,
            authorize_case_usage: progressData.complementary_info?.authorize_case_usage || false,
            interested_in_interview: progressData.complementary_info?.interested_in_interview || false,
            priority_topics: progressData.complementary_info?.priority_topics || []
          });
          
          setHasExistingData(true);
        } else {
          console.log('ℹ️ Nenhum dado encontrado na onboarding_progress, tentando quick_onboarding...');
          
          // Fallback: buscar dados na tabela quick_onboarding (estrutura simplificada)
          const { data: quickData, error: quickError } = await supabase
            .from('quick_onboarding')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (quickData && !quickError) {
            console.log('✅ Dados encontrados na quick_onboarding:', quickData);
            setData({
              ...initialData,
              name: quickData.name || '',
              email: quickData.email || user.email || '',
              whatsapp: quickData.whatsapp || '',
              country_code: quickData.country_code || '+55',
              instagram_url: quickData.instagram_url || '',
              linkedin_url: quickData.linkedin_url || '',
              how_found_us: quickData.how_found_us || '',
              referred_by: quickData.referred_by || '',
              company_name: quickData.company_name || '',
              role: quickData.role || '',
              company_size: quickData.company_size || '',
              company_segment: quickData.company_segment || '',
              company_website: quickData.company_website || '',
              annual_revenue_range: quickData.annual_revenue_range || '',
              main_challenge: quickData.main_challenge || '',
              ai_knowledge_level: quickData.ai_knowledge_level || '',
              uses_ai: quickData.uses_ai || '',
              main_goal: quickData.main_goal || ''
            });
            setHasExistingData(true);
          } else {
            console.log('ℹ️ Nenhum dado encontrado, iniciando com dados vazios');
            // Inicializar com dados básicos do usuário
            setData(prev => ({
              ...prev,
              email: user.email || '',
              name: user.user_metadata?.name || ''
            }));
          }
        }
      } catch (error: any) {
        console.error('❌ Erro ao carregar dados:', error);
        setLoadError('Erro ao carregar seus dados. Você pode continuar mesmo assim.');
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [user]);

  return {
    data,
    setData,
    isLoading,
    hasExistingData,
    loadError
  };
};
