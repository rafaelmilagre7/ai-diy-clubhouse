
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { toast } from 'sonner';

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const [data, setData] = useState<QuickOnboardingData>({
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
    main_challenge: '',
    business_challenges: [],
    short_term_goals: [],
    medium_term_goals: [],
    important_kpis: [],
    additional_context: '',
    main_goal: '',
    primary_goal: '',
    expected_outcomes: [],
    expected_outcome_30days: '',
    priority_solution_type: '',
    how_implement: '',
    week_availability: '',
    content_formats: [],
    ai_knowledge_level: '',
    uses_ai: '',
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
    live_interest: 5,
    authorize_case_usage: false,
    interested_in_interview: false,
    priority_topics: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const totalSteps = 8;

  // Carregar dados existentes da tabela onboarding_progress
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        console.log('🔍 Carregando dados do onboarding_progress...');
        
        const { data: existingProgress, error } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Erro ao carregar dados:', error);
          return;
        }

        if (existingProgress) {
          console.log('✅ Dados encontrados:', existingProgress);
          
          // Mapear dados do onboarding_progress para QuickOnboardingData
          const mappedData = mapProgressToQuickData(existingProgress);
          setData(mappedData);
          
          // Determinar próxima etapa baseado nos dados
          if (existingProgress.is_completed) {
            setCurrentStep(9); // Vai para a experiência mágica
          } else {
            setCurrentStep(determineNextStep(mappedData));
          }
        } else {
          console.log('📋 Nenhum progresso encontrado, iniciando novo onboarding');
        }
      } catch (error) {
        console.error('❌ Erro inesperado ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [user?.id]);

  // Mapear dados do onboarding_progress para QuickOnboardingData
  const mapProgressToQuickData = (progress: any): QuickOnboardingData => {
    return {
      // Dados pessoais
      name: progress.personal_info?.name || '',
      email: progress.personal_info?.email || user?.email || '',
      whatsapp: progress.personal_info?.phone || '',
      country_code: progress.personal_info?.ddi || '+55',
      birth_date: '',
      
      // Localização
      country: progress.personal_info?.country || '',
      state: progress.personal_info?.state || '',
      city: progress.personal_info?.city || '',
      timezone: progress.personal_info?.timezone || '',
      instagram_url: progress.personal_info?.instagram || '',
      linkedin_url: progress.personal_info?.linkedin || '',
      
      // Como nos conheceu
      how_found_us: progress.complementary_info?.how_found_us || '',
      referred_by: progress.complementary_info?.referred_by || '',
      
      // Dados profissionais
      company_name: progress.professional_info?.company_name || progress.company_name || '',
      role: progress.personal_info?.role || progress.current_position || '',
      company_size: progress.professional_info?.company_size || progress.company_size || '',
      company_segment: progress.professional_info?.company_sector || progress.company_sector || '',
      company_website: progress.professional_info?.company_website || progress.company_website || '',
      annual_revenue_range: progress.professional_info?.annual_revenue || progress.annual_revenue || '',
      current_position: progress.professional_info?.current_position || progress.current_position || '',
      
      // Contexto do negócio
      business_model: progress.business_context?.business_model || '',
      main_challenge: progress.business_context?.main_challenge || '',
      business_challenges: progress.business_context?.business_challenges || [],
      short_term_goals: progress.business_context?.short_term_goals || [],
      medium_term_goals: progress.business_context?.medium_term_goals || [],
      important_kpis: progress.business_context?.important_kpis || [],
      additional_context: progress.business_context?.additional_context || '',
      
      // Objetivos e metas
      main_goal: progress.business_goals?.primary_goal || '',
      primary_goal: progress.business_goals?.primary_goal || '',
      expected_outcomes: progress.business_goals?.expected_outcomes || [],
      expected_outcome_30days: progress.business_goals?.expected_outcome_30days || '',
      priority_solution_type: progress.business_goals?.priority_solution_type || '',
      how_implement: progress.business_goals?.how_implement || '',
      week_availability: progress.business_goals?.week_availability || '',
      content_formats: progress.business_goals?.content_formats || [],
      
      // Experiência com IA
      ai_knowledge_level: progress.ai_experience?.knowledge_level || '',
      uses_ai: progress.ai_experience?.uses_ai || '',
      previous_tools: progress.ai_experience?.previous_tools || [],
      has_implemented: progress.ai_experience?.has_implemented || '',
      desired_ai_areas: progress.ai_experience?.desired_ai_areas || [],
      completed_formation: progress.ai_experience?.completed_formation || false,
      is_member_for_month: progress.ai_experience?.is_member_for_month || false,
      nps_score: progress.ai_experience?.nps_score || 0,
      improvement_suggestions: progress.ai_experience?.improvement_suggestions || '',
      
      // Personalização da experiência
      interests: progress.experience_personalization?.interests || [],
      time_preference: progress.experience_personalization?.time_preference || [],
      available_days: progress.experience_personalization?.available_days || [],
      networking_availability: progress.experience_personalization?.networking_availability || 5,
      skills_to_share: progress.experience_personalization?.skills_to_share || [],
      mentorship_topics: progress.experience_personalization?.mentorship_topics || [],
      
      // Campos complementares
      live_interest: progress.business_goals?.live_interest || 5,
      authorize_case_usage: progress.complementary_info?.authorize_case_usage || false,
      interested_in_interview: progress.complementary_info?.interested_in_interview || false,
      priority_topics: progress.complementary_info?.priority_topics || []
    };
  };

  // Mapear QuickOnboardingData para estrutura do onboarding_progress
  const mapQuickDataToProgress = (quickData: QuickOnboardingData, step: number) => {
    const updateData: any = {
      user_id: user?.id,
      current_step: getStepName(step),
      updated_at: new Date().toISOString()
    };

    // Mapear dados por seção
    switch (step) {
      case 1: // Dados pessoais
        updateData.personal_info = {
          name: quickData.name,
          email: quickData.email,
          phone: quickData.whatsapp,
          ddi: quickData.country_code,
          role: quickData.role
        };
        break;
        
      case 2: // Localização
        updateData.personal_info = {
          ...updateData.personal_info,
          country: quickData.country,
          state: quickData.state,
          city: quickData.city,
          timezone: quickData.timezone,
          instagram: quickData.instagram_url,
          linkedin: quickData.linkedin_url
        };
        break;
        
      case 3: // Como nos conheceu
        updateData.complementary_info = {
          how_found_us: quickData.how_found_us,
          referred_by: quickData.referred_by
        };
        break;
        
      case 4: // Dados profissionais
        updateData.professional_info = {
          company_name: quickData.company_name,
          company_size: quickData.company_size,
          company_sector: quickData.company_segment,
          company_website: quickData.company_website,
          current_position: quickData.current_position,
          annual_revenue: quickData.annual_revenue_range
        };
        // Campos de compatibilidade
        updateData.company_name = quickData.company_name;
        updateData.company_size = quickData.company_size;
        updateData.company_sector = quickData.company_segment;
        updateData.company_website = quickData.company_website;
        updateData.current_position = quickData.current_position;
        updateData.annual_revenue = quickData.annual_revenue_range;
        break;
        
      case 5: // Contexto do negócio
        updateData.business_context = {
          business_model: quickData.business_model,
          main_challenge: quickData.main_challenge,
          business_challenges: quickData.business_challenges,
          short_term_goals: quickData.short_term_goals,
          medium_term_goals: quickData.medium_term_goals,
          important_kpis: quickData.important_kpis,
          additional_context: quickData.additional_context
        };
        break;
        
      case 6: // Objetivos e metas
        updateData.business_goals = {
          primary_goal: quickData.main_goal,
          expected_outcomes: quickData.expected_outcomes,
          expected_outcome_30days: quickData.expected_outcome_30days,
          priority_solution_type: quickData.priority_solution_type,
          how_implement: quickData.how_implement,
          week_availability: quickData.week_availability,
          content_formats: quickData.content_formats,
          live_interest: quickData.live_interest
        };
        break;
        
      case 7: // Experiência com IA
        updateData.ai_experience = {
          knowledge_level: quickData.ai_knowledge_level,
          uses_ai: quickData.uses_ai,
          previous_tools: quickData.previous_tools,
          has_implemented: quickData.has_implemented,
          desired_ai_areas: quickData.desired_ai_areas,
          completed_formation: quickData.completed_formation,
          is_member_for_month: quickData.is_member_for_month,
          nps_score: quickData.nps_score,
          improvement_suggestions: quickData.improvement_suggestions
        };
        break;
        
      case 8: // Personalização da experiência
        updateData.experience_personalization = {
          interests: quickData.interests,
          time_preference: quickData.time_preference,
          available_days: quickData.available_days,
          networking_availability: quickData.networking_availability,
          skills_to_share: quickData.skills_to_share,
          mentorship_topics: quickData.mentorship_topics
        };
        
        // Dados complementares finais
        updateData.complementary_info = {
          ...updateData.complementary_info,
          authorize_case_usage: quickData.authorize_case_usage,
          interested_in_interview: quickData.interested_in_interview,
          priority_topics: quickData.priority_topics
        };
        break;
    }

    return updateData;
  };

  // Obter nome da etapa
  const getStepName = (step: number): string => {
    const stepNames = [
      'personal_info',
      'location_social',
      'how_found_us',
      'professional_info',
      'business_context',
      'business_goals',
      'ai_experience',
      'experience_personalization'
    ];
    return stepNames[step - 1] || 'personal_info';
  };

  // Determinar próxima etapa baseado nos dados
  const determineNextStep = (data: QuickOnboardingData): number => {
    if (!data.name || !data.email || !data.whatsapp) return 1;
    if (!data.country || !data.state || !data.city) return 2;
    if (!data.how_found_us) return 3;
    if (!data.company_name || !data.role || !data.company_size) return 4;
    if (!data.business_model || !data.main_challenge) return 5;
    if (!data.main_goal || !data.expected_outcome_30days) return 6;
    if (!data.ai_knowledge_level || !data.uses_ai) return 7;
    if (!data.interests || data.interests.length === 0) return 8;
    return 9; // Todas as etapas completas
  };

  // Validação para permitir avançar
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return !!(data.name && data.email && data.whatsapp);
      case 2:
        return !!(data.country && data.state && data.city);
      case 3:
        return !!data.how_found_us;
      case 4:
        return !!(data.company_name && data.role && data.company_size && data.company_segment);
      case 5:
        return !!(data.business_model && data.main_challenge);
      case 6:
        return !!(data.main_goal && data.expected_outcome_30days && data.priority_solution_type && data.how_implement && data.week_availability);
      case 7:
        return !!(data.ai_knowledge_level && data.uses_ai);
      case 8:
        return !!(data.interests && data.interests.length > 0);
      default:
        return true;
    }
  }, [currentStep, data]);

  // Atualizar campo
  const updateField = useCallback((field: keyof QuickOnboardingData, value: string | string[] | number | boolean) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Salvar dados no banco usando onboarding_progress
  const saveData = useCallback(async () => {
    if (!user?.id) return false;

    try {
      setIsSaving(true);
      console.log('💾 Salvando dados na onboarding_progress...');
      
      const updateData = mapQuickDataToProgress(data, currentStep);
      
      const { error } = await supabase
        .from('onboarding_progress')
        .upsert(updateData);

      if (error) {
        console.error('❌ Erro ao salvar dados:', error);
        toast.error('Erro ao salvar dados');
        return false;
      }

      console.log('✅ Dados salvos com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar:', error);
      toast.error('Erro inesperado ao salvar dados');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, data, currentStep]);

  // Próximo passo
  const nextStep = useCallback(async () => {
    const saved = await saveData();
    if (saved && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [saveData, currentStep, totalSteps]);

  // Passo anterior
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Completar onboarding
  const completeOnboarding = useCallback(async () => {
    if (!user?.id) return false;

    try {
      setIsCompleting(true);
      console.log('🎯 Finalizando onboarding...');
      
      // Salvar dados finais marcando como completo
      const finalData = mapQuickDataToProgress(data, currentStep);
      finalData.is_completed = true;
      finalData.completed_at = new Date().toISOString();
      finalData.current_step = 'completed';
      
      const { error } = await supabase
        .from('onboarding_progress')
        .upsert(finalData);

      if (error) {
        console.error('❌ Erro ao finalizar onboarding:', error);
        toast.error('Erro ao finalizar onboarding');
        return false;
      }

      // Ir para a experiência mágica
      setCurrentStep(9);
      toast.success('Onboarding concluído com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado ao finalizar:', error);
      toast.error('Erro inesperado ao finalizar onboarding');
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [user?.id, data, currentStep]);

  return {
    data,
    currentStep,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed: canProceed(),
    totalSteps,
    isSaving,
    isCompleting,
    isLoading
  };
};
