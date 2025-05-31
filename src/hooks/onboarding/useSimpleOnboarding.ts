
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { mapQuickToProgress, validateStepData } from '@/utils/onboarding/dataMappers';
import { useOnboardingProgress } from './useOnboardingProgress';
import { useDebounce } from '@/hooks/common/useDebounce';
import { toast } from 'sonner';

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { saveProgress, loadProgress, completeOnboarding: markComplete, isLoading, isSaving } = useOnboardingProgress();
  
  const [data, setData] = useState<QuickOnboardingData>({
    // Etapa 1 - Informações Pessoais
    name: '',
    email: user?.email || '',
    whatsapp: '',
    country_code: '+55',
    
    // Etapa 2 - Localização e Redes (removendo timezone)
    country: 'Brasil',
    state: '',
    city: '',
    instagram_url: '',
    linkedin_url: '',
    
    // Etapa 3 - Como nos conheceu
    how_found_us: '',
    referred_by: '',
    
    // Etapa 4 - Seu negócio
    company_name: '',
    role: '',
    company_size: '',
    company_segment: '',
    company_website: '',
    annual_revenue_range: '',
    
    // Etapa 5 - Contexto do negócio
    business_model: '',
    business_challenges: [],
    short_term_goals: [],
    medium_term_goals: [],
    important_kpis: [],
    additional_context: '',
    
    // Etapa 6 - Objetivos e metas
    primary_goal: '',
    expected_outcomes: [],
    expected_outcome_30days: '',
    priority_solution_type: '',
    how_implement: '',
    week_availability: '',
    content_formats: [],
    
    // Etapa 7 - Experiência com IA
    ai_knowledge_level: '',
    previous_tools: [],
    has_implemented: '',
    desired_ai_areas: [],
    completed_formation: false,
    is_member_for_month: false,
    nps_score: 0,
    improvement_suggestions: '',
    
    // Etapa 8 - Personalização
    interests: [],
    time_preference: [],
    available_days: [],
    networking_availability: 5,
    skills_to_share: [],
    mentorship_topics: [],
    
    // Campos de controle
    live_interest: 5,
    authorize_case_usage: false,
    interested_in_interview: false,
    priority_topics: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const totalSteps = 8;

  // Auto-save com debounce para evitar muitas chamadas
  const debouncedSave = useDebounce(async (dataToSave: QuickOnboardingData, step: number) => {
    if (!user?.id) return;
    
    try {
      console.log(`🔄 Auto-salvando step ${step}...`);
      
      // Mapear dados para o formato correto
      const progressData = mapQuickToProgress(dataToSave);
      
      // Adicionar step atual e controle
      const saveData = {
        ...progressData,
        current_step: `step_${step}`,
        is_completed: false,
        updated_at: new Date().toISOString()
      };

      await saveProgress(saveData);
      console.log(`✅ Auto-save do step ${step} concluído`);
    } catch (error) {
      console.error('❌ Erro no auto-save:', error);
      // Não mostrar toast de erro para auto-save silencioso
    }
  }, 1500); // Debounce de 1.5 segundos

  // Carregar dados salvos ao inicializar
  useEffect(() => {
    const loadSavedData = async () => {
      if (!user?.id) return;
      
      try {
        const progress = await loadProgress();
        if (progress) {
          // Converter de volta para QuickOnboardingData se necessário
          const personalInfo = progress.personal_info || {};
          const professionalInfo = progress.professional_info || {};
          const businessContext = progress.business_context || {};
          const businessGoals = progress.business_goals || {};
          const aiExperience = progress.ai_experience || {};
          const personalization = progress.experience_personalization || {};
          const complementary = progress.complementary_info || {};

          setData(prev => ({
            ...prev,
            // Informações pessoais
            name: personalInfo.name || prev.name,
            email: personalInfo.email || prev.email,
            whatsapp: personalInfo.whatsapp || prev.whatsapp,
            country_code: personalInfo.country_code || prev.country_code,
            
            // Localização
            country: complementary.country || prev.country,
            state: complementary.state || prev.state,
            city: complementary.city || prev.city,
            instagram_url: complementary.instagram_url || prev.instagram_url,
            linkedin_url: complementary.linkedin_url || prev.linkedin_url,
            
            // Como conheceu
            how_found_us: complementary.how_found_us || prev.how_found_us,
            referred_by: complementary.referred_by || prev.referred_by,
            
            // Negócio
            company_name: professionalInfo.company_name || prev.company_name,
            role: professionalInfo.role || prev.role,
            company_size: professionalInfo.company_size || prev.company_size,
            company_segment: professionalInfo.company_segment || prev.company_segment,
            company_website: professionalInfo.company_website || prev.company_website,
            annual_revenue_range: professionalInfo.annual_revenue_range || prev.annual_revenue_range,
            
            // Contexto
            business_model: businessContext.business_model || prev.business_model,
            business_challenges: businessContext.business_challenges || prev.business_challenges,
            short_term_goals: businessContext.short_term_goals || prev.short_term_goals,
            medium_term_goals: businessContext.medium_term_goals || prev.medium_term_goals,
            important_kpis: businessContext.important_kpis || prev.important_kpis,
            additional_context: businessContext.additional_context || prev.additional_context,
            
            // Objetivos
            primary_goal: businessGoals.primary_goal || prev.primary_goal,
            expected_outcomes: businessGoals.expected_outcomes || prev.expected_outcomes,
            expected_outcome_30days: businessGoals.expected_outcome_30days || prev.expected_outcome_30days,
            priority_solution_type: businessGoals.priority_solution_type || prev.priority_solution_type,
            how_implement: businessGoals.how_implement || prev.how_implement,
            week_availability: businessGoals.week_availability || prev.week_availability,
            content_formats: businessGoals.content_formats || prev.content_formats,
            
            // IA
            ai_knowledge_level: aiExperience.ai_knowledge_level || prev.ai_knowledge_level,
            previous_tools: aiExperience.previous_tools || prev.previous_tools,
            has_implemented: aiExperience.has_implemented || prev.has_implemented,
            desired_ai_areas: aiExperience.desired_ai_areas || prev.desired_ai_areas,
            completed_formation: aiExperience.completed_formation || prev.completed_formation,
            is_member_for_month: aiExperience.is_member_for_month || prev.is_member_for_month,
            nps_score: aiExperience.nps_score || prev.nps_score,
            improvement_suggestions: aiExperience.improvement_suggestions || prev.improvement_suggestions,
            
            // Personalização
            interests: personalization.interests || prev.interests,
            time_preference: personalization.time_preference || prev.time_preference,
            available_days: personalization.available_days || prev.available_days,
            networking_availability: personalization.networking_availability || prev.networking_availability,
            skills_to_share: personalization.skills_to_share || prev.skills_to_share,
            mentorship_topics: personalization.mentorship_topics || prev.mentorship_topics,
            authorize_case_usage: personalization.authorize_case_usage || prev.authorize_case_usage,
            interested_in_interview: personalization.interested_in_interview || prev.interested_in_interview,
            priority_topics: personalization.priority_topics || prev.priority_topics
          }));

          // Determinar step atual baseado no progresso
          const currentStepFromProgress = progress.current_step;
          if (currentStepFromProgress && currentStepFromProgress.startsWith('step_')) {
            const stepNumber = parseInt(currentStepFromProgress.replace('step_', ''));
            if (stepNumber >= 1 && stepNumber <= totalSteps) {
              setCurrentStep(stepNumber);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
      }
    };

    loadSavedData();
  }, [user?.id, loadProgress]);

  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Trigger auto-save com debounce
      debouncedSave(newData, currentStep);
      
      return newData;
    });
  }, [currentStep, debouncedSave]);

  const nextStep = useCallback(async () => {
    if (currentStep < totalSteps) {
      const nextStepNumber = currentStep + 1;
      setCurrentStep(nextStepNumber);
      
      // Salvar progresso imediatamente ao avançar step
      try {
        const progressData = mapQuickToProgress(data);
        await saveProgress({
          ...progressData,
          current_step: `step_${nextStepNumber}`,
          is_completed: false
        });
        console.log(`✅ Progresso salvo ao avançar para step ${nextStepNumber}`);
      } catch (error) {
        console.error('Erro ao salvar progresso:', error);
        toast.error('Erro ao salvar progresso');
      }
    }
  }, [currentStep, totalSteps, data, saveProgress]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    setIsCompleting(true);
    
    try {
      console.log('🎯 Finalizando onboarding...');
      
      // Mapear dados finais
      const finalProgressData = mapQuickToProgress(data);
      
      // Salvar dados finais
      await saveProgress({
        ...finalProgressData,
        current_step: 'completed',
        is_completed: true,
        completed_at: new Date().toISOString()
      });

      // Marcar como completo
      const success = await markComplete();
      
      if (success) {
        console.log('✅ Onboarding finalizado com sucesso');
        toast.success('Onboarding concluído com sucesso!');
        return true;
      } else {
        throw new Error('Falha ao marcar onboarding como completo');
      }
    } catch (error) {
      console.error('❌ Erro ao finalizar onboarding:', error);
      toast.error('Erro ao finalizar onboarding');
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [data, saveProgress, markComplete]);

  const canProceed = useCallback(() => {
    return validateStepData(currentStep, data);
  }, [currentStep, data]);

  return {
    data,
    currentStep,
    totalSteps,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed: canProceed(),
    isLoading,
    isSaving,
    isCompleting
  };
};
