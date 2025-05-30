
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { QuickOnboardingData } from '@/types/quickOnboarding';

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

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const [data, setData] = useState<QuickOnboardingData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Carregar dados existentes do usuário
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        
        // Buscar dados na tabela onboarding_progress
        const { data: progressData, error } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (progressData && !error) {
          console.log('✅ Dados encontrados no onboarding_progress:', progressData);
          
          // Mapear dados do banco para o formato do hook
          setData(prev => ({
            ...prev,
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
          }));
          
          // Definir step atual baseado no progresso
          setCurrentStep(progressData.current_step ? getStepNumber(progressData.current_step) : 1);
        } else {
          console.log('ℹ️ Nenhum dado encontrado, iniciando onboarding do zero');
          // Inicializar com dados básicos do usuário
          setData(prev => ({
            ...prev,
            email: user.email || '',
            name: user.user_metadata?.name || ''
          }));
        }
      } catch (error: any) {
        console.error('❌ Erro ao carregar dados:', error);
        toast.error('Erro ao carregar seus dados. Você pode continuar mesmo assim.');
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [user]);

  const getStepNumber = (stepName: string): number => {
    const stepMap: Record<string, number> = {
      'personal_info': 1,
      'location_social': 2,
      'how_found_us': 3,
      'professional_info': 4,
      'business_context': 5,
      'business_goals': 6,
      'ai_experience': 7,
      'experience_personalization': 8,
      'trail_generation': 9
    };
    return stepMap[stepName] || 1;
  };

  const getStepName = (stepNumber: number): string => {
    const nameMap: Record<number, string> = {
      1: 'personal_info',
      2: 'location_social',
      3: 'how_found_us',
      4: 'professional_info',
      5: 'business_context',
      6: 'business_goals',
      7: 'ai_experience',
      8: 'experience_personalization',
      9: 'trail_generation'
    };
    return nameMap[stepNumber] || 'personal_info';
  };

  const updateField = (field: keyof QuickOnboardingData, value: string | string[] | number | boolean) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Informações Pessoais Básicas
        return !!(data.name && data.email && data.whatsapp);
      case 2: // Localização e Redes Sociais
        return !!(data.country && data.state && data.city);
      case 3: // Como nos conheceu
        return !!(data.how_found_us);
      case 4: // Informações Profissionais
        return !!(data.company_name && data.role && data.company_size && data.company_segment);
      case 5: // Contexto do Negócio
        return !!(data.business_model && data.main_challenge);
      case 6: // Objetivos e Metas
        return !!(data.main_goal && data.primary_goal);
      case 7: // Experiência com IA
        return !!(data.ai_knowledge_level && data.uses_ai);
      case 8: // Personalização da Experiência
        return !!(data.interests.length > 0);
      default:
        return false;
    }
  };

  const nextStep = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    // Salvar dados antes de ir para próximo step
    await saveData();
    
    if (currentStep < 8) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Último step - iniciar geração da trilha
      setCurrentStep(9);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const saveData = async () => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);
      
      // Preparar dados para salvar no formato da tabela onboarding_progress
      const progressData = {
        user_id: user.id,
        current_step: getStepName(currentStep),
        is_completed: false,
        completed_steps: Array.from({ length: currentStep }, (_, i) => getStepName(i + 1)),
        
        // Dados estruturados em JSONB
        personal_info: {
          name: data.name,
          email: data.email,
          phone: data.whatsapp,
          ddi: data.country_code,
          birth_date: data.birth_date,
          country: data.country,
          state: data.state,
          city: data.city,
          timezone: data.timezone,
          instagram: data.instagram_url,
          linkedin: data.linkedin_url
        },
        
        professional_info: {
          company_name: data.company_name,
          current_position: data.role,
          company_size: data.company_size,
          company_sector: data.company_segment,
          company_website: data.company_website,
          annual_revenue: data.annual_revenue_range
        },
        
        business_context: {
          business_model: data.business_model,
          business_challenges: data.business_challenges,
          short_term_goals: data.short_term_goals,
          medium_term_goals: data.medium_term_goals,
          important_kpis: data.important_kpis,
          additional_context: data.additional_context
        },
        
        business_goals: {
          primary_goal: data.primary_goal,
          expected_outcomes: data.expected_outcomes,
          expected_outcome_30days: data.expected_outcome_30days,
          priority_solution_type: data.priority_solution_type,
          how_implement: data.how_implement,
          week_availability: data.week_availability,
          content_formats: data.content_formats,
          live_interest: data.live_interest
        },
        
        ai_experience: {
          knowledge_level: data.ai_knowledge_level,
          previous_tools: data.previous_tools,
          has_implemented: data.has_implemented,
          desired_ai_areas: data.desired_ai_areas,
          completed_formation: data.completed_formation,
          is_member_for_month: data.is_member_for_month,
          nps_score: data.nps_score,
          improvement_suggestions: data.improvement_suggestions
        },
        
        experience_personalization: {
          interests: data.interests,
          time_preference: data.time_preference,
          available_days: data.available_days,
          networking_availability: data.networking_availability,
          skills_to_share: data.skills_to_share,
          mentorship_topics: data.mentorship_topics
        },
        
        complementary_info: {
          how_found_us: data.how_found_us,
          referred_by: data.referred_by,
          authorize_case_usage: data.authorize_case_usage,
          interested_in_interview: data.interested_in_interview,
          priority_topics: data.priority_topics
        },
        
        // Campos top-level para compatibilidade
        company_name: data.company_name,
        company_size: data.company_size,
        company_sector: data.company_segment,
        company_website: data.company_website,
        current_position: data.role,
        annual_revenue: data.annual_revenue_range,
        
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('onboarding_progress')
        .upsert(progressData);

      if (error) {
        console.error('Erro ao salvar dados:', error);
        toast.error('Erro ao salvar dados');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user?.id) return false;

    try {
      setIsCompleting(true);
      
      // Primeiro salvar todos os dados
      const saveSuccess = await saveData();
      if (!saveSuccess) return false;

      // Depois marcar como completo
      const { error } = await supabase
        .from('onboarding_progress')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          current_step: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao completar onboarding:', error);
        toast.error('Erro ao finalizar onboarding');
        return false;
      }

      toast.success('Onboarding concluído com sucesso! 🎉');
      return true;
    } catch (error) {
      console.error('Erro inesperado ao completar:', error);
      toast.error('Erro inesperado ao finalizar');
      return false;
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    data,
    currentStep,
    isLoading,
    isSaving,
    isCompleting,
    updateField,
    nextStep,
    previousStep,
    saveData,
    completeOnboarding,
    canProceed: validateStep(currentStep),
    totalSteps: 8
  };
};
