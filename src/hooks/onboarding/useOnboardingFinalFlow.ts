
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingFinalData, CompleteOnboardingResponse } from '@/types/onboardingFinal';
import { toast } from 'sonner';

export const useOnboardingFinalFlow = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState<OnboardingFinalData>({
    personal_info: {
      name: '',
      email: '',
      whatsapp: '',
      country_code: '',
      phone: '',
      birth_date: '',
      gender: '',
      timezone: ''
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
      nps_score: 0,
      improvement_suggestions: '',
      implemented_solutions: [],
      desired_solutions: [],
      previous_attempts: '',
      ai_tools: [],
      suggestions: ''
    },
    personalization: {
      interests: [],
      time_preference: [],
      available_days: [],
      networking_availability: '',
      skills_to_share: [],
      mentorship_topics: [],
      live_interest: '',
      authorize_case_usage: false,
      interested_in_interview: false,
      priority_topics: [],
      content_formats: []
    }
  });

  const totalSteps = 8;

  // Carregar dados existentes
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Carregando dados do onboarding final...');

        const { data: existingData, error } = await supabase
          .from('onboarding_final')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Erro ao carregar dados:', error);
          throw error;
        }

        if (existingData) {
          console.log('✅ Dados encontrados, carregando...');
          setData({
            id: existingData.id,
            user_id: existingData.user_id,
            is_completed: existingData.is_completed,
            completed_at: existingData.completed_at,
            personal_info: existingData.personal_info || {},
            location_info: existingData.location_info || {},
            discovery_info: existingData.discovery_info || {},
            business_info: existingData.business_info || {},
            business_context: existingData.business_context || {},
            goals_info: existingData.goals_info || {},
            ai_experience: existingData.ai_experience || {},
            personalization: existingData.personalization || {},
            created_at: existingData.created_at,
            updated_at: existingData.updated_at
          });

          // Se já está completo, redirecionar
          if (existingData.is_completed) {
            console.log('✅ Onboarding já completado');
          }
        } else {
          console.log('ℹ️ Nenhum dado existente encontrado');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados do onboarding');
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [user?.id]);

  // Atualizar seção específica
  const updateSection = useCallback((section: keyof OnboardingFinalData, updates: any) => {
    console.log(`🔄 Atualizando seção ${section}:`, updates);
    
    setData(prev => {
      const currentSection = prev[section] || {};
      return {
        ...prev,
        [section]: {
          ...currentSection,
          ...updates
        }
      };
    });

    // Auto-salvar após 2 segundos
    setTimeout(async () => {
      if (!user?.id) return;

      try {
        const updatedData = {
          ...data,
          [section]: {
            ...(data[section] || {}),
            ...updates
          }
        };

        await saveData(updatedData);
      } catch (error) {
        console.error('❌ Erro no auto-save:', error);
      }
    }, 2000);
  }, [data, user?.id]);

  // Salvar dados no Supabase
  const saveData = async (dataToSave: OnboardingFinalData) => {
    if (!user?.id) return;

    try {
      console.log('💾 Salvando dados...');

      const payload = {
        user_id: user.id,
        personal_info: dataToSave.personal_info || {},
        location_info: dataToSave.location_info || {},
        discovery_info: dataToSave.discovery_info || {},
        business_info: dataToSave.business_info || {},
        business_context: dataToSave.business_context || {},
        goals_info: dataToSave.goals_info || {},
        ai_experience: dataToSave.ai_experience || {},
        personalization: dataToSave.personalization || {},
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('onboarding_final')
        .upsert(payload);

      if (error) throw error;

      console.log('✅ Dados salvos com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error);
      throw error;
    }
  };

  // Validar se pode prosseguir
  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 1: // Informações Pessoais
        return !!(data.personal_info?.name && data.personal_info?.email);
      case 2: // Localização
        return !!(data.location_info?.country && data.location_info?.city);
      case 3: // Discovery
        return !!data.discovery_info?.how_found_us;
      case 4: // Business Info
        return !!(data.business_info?.company_name && data.business_info?.role);
      case 5: // Business Context
        return !!(data.business_context?.business_model);
      case 6: // Goals
        return !!(data.goals_info?.primary_goal);
      case 7: // AI Experience
        return !!(data.ai_experience?.ai_knowledge_level);
      case 8: // Personalization
        return !!(data.personalization?.interests && data.personalization.interests.length > 0);
      default:
        return true;
    }
  }, [currentStep, data]);

  // Próxima etapa
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps && canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps, canProceed]);

  // Etapa anterior
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Finalizar onboarding
  const completeOnboarding = useCallback(async (): Promise<CompleteOnboardingResponse> => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    setIsSubmitting(true);

    try {
      console.log('🚀 Finalizando onboarding...');

      // Verificar se já está completo
      const { data: existingData } = await supabase
        .from('onboarding_final')
        .select('is_completed')
        .eq('user_id', user.id)
        .single();

      if (existingData?.is_completed) {
        return { 
          success: true, 
          wasAlreadyCompleted: true,
          data: existingData 
        };
      }

      // Marcar como completo
      const { error } = await supabase
        .from('onboarding_final')
        .upsert({
          user_id: user.id,
          personal_info: data.personal_info || {},
          location_info: data.location_info || {},
          discovery_info: data.discovery_info || {},
          business_info: data.business_info || {},
          business_context: data.business_context || {},
          goals_info: data.goals_info || {},
          ai_experience: data.ai_experience || {},
          personalization: data.personalization || {},
          is_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      console.log('✅ Onboarding finalizado com sucesso');
      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao finalizar onboarding:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
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
    canProceed,
    currentStep,
    totalSteps,
    isSubmitting,
    isLoading,
    validationErrors
  };
};
