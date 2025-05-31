
import { useState, useCallback } from 'react';
import { OnboardingFinalData, CompleteOnboardingResponse } from '@/types/onboardingFinal';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { validateBrazilianWhatsApp, cleanWhatsApp } from '@/utils/validationUtils';

const TOTAL_STEPS = 8;

// Estado inicial dos dados
const initialData: OnboardingFinalData = {
  personal_info: {
    name: '',
    email: '',
    whatsapp: '',
    country_code: '+55',
    birth_date: '',
    gender: ''
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
    improvement_suggestions: ''
  },
  personalization: {
    interests: [],
    time_preference: [],
    available_days: [],
    networking_availability: '0',
    skills_to_share: [],
    mentorship_topics: [],
    live_interest: '0',
    authorize_case_usage: false,
    interested_in_interview: false,
    priority_topics: [],
    content_formats: []
  }
};

// Função para validar idade mínima
const validateMinimumAge = (birthDate: string): boolean => {
  if (!birthDate) return false;
  
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 18;
  }
  
  return age >= 18;
};

export const useOnboardingFinalFlow = () => {
  const { user } = useAuth();
  const [data, setData] = useState<OnboardingFinalData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Atualizar seção específica dos dados
  const updateSection = useCallback((section: keyof OnboardingFinalData, updates: any) => {
    console.log(`🔄 Atualizando seção ${section} com:`, updates);
    
    setData(prevData => {
      const newData = {
        ...prevData,
        [section]: updates
      };
      console.log(`✅ Dados atualizados para ${section}:`, newData[section]);
      return newData;
    });
    
    // Limpar erros de validação quando o usuário atualizar os dados
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(updates).forEach(key => {
        delete newErrors[key];
      });
      return newErrors;
    });
  }, []);

  // Navegar para próxima etapa
  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
      setValidationErrors({}); // Limpar erros ao mudar de etapa
    }
  }, [currentStep]);

  // Navegar para etapa anterior
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setValidationErrors({}); // Limpar erros ao mudar de etapa
    }
  }, [currentStep]);

  // Validar se pode prosseguir para próxima etapa
  const canProceed = useCallback(() => {
    const errors: Record<string, string> = {};

    switch (currentStep) {
      case 1: // Personal Info
        if (!data.personal_info.name?.trim()) {
          errors.name = 'Nome é obrigatório';
        }
        
        if (!data.personal_info.email?.trim()) {
          errors.email = 'E-mail é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal_info.email)) {
          errors.email = 'E-mail deve ter um formato válido';
        }
        
        if (!data.personal_info.whatsapp?.trim()) {
          errors.whatsapp = 'WhatsApp é obrigatório';
        } else {
          const cleanedWhatsApp = cleanWhatsApp(data.personal_info.whatsapp);
          if (!validateBrazilianWhatsApp(cleanedWhatsApp)) {
            errors.whatsapp = 'WhatsApp deve ter formato válido (11 dígitos, começando com 9)';
          }
        }
        
        if (!data.personal_info.birth_date) {
          errors.birth_date = 'Data de nascimento é obrigatória';
        } else if (!validateMinimumAge(data.personal_info.birth_date)) {
          errors.birth_date = 'Você deve ter pelo menos 18 anos';
        }
        
        if (!data.personal_info.gender || data.personal_info.gender === '') {
          errors.gender = 'Gênero é obrigatório';
        }
        break;
      
      case 2: // Location Info
        if (!data.location_info.country?.trim()) {
          errors.country = 'País é obrigatório';
        }
        if (!data.location_info.state?.trim()) {
          errors.state = 'Estado é obrigatório';
        }
        if (!data.location_info.city?.trim()) {
          errors.city = 'Cidade é obrigatória';
        }
        break;
      
      case 3: // Discovery Info
        if (!data.discovery_info.how_found_us) {
          errors.how_found_us = 'Como nos conheceu é obrigatório';
        }
        break;
      
      case 4: // Business Info
        if (!data.business_info.company_name?.trim()) {
          errors.company_name = 'Nome da empresa é obrigatório';
        }
        if (!data.business_info.role?.trim()) {
          errors.role = 'Cargo é obrigatório';
        }
        if (!data.business_info.company_size) {
          errors.company_size = 'Tamanho da empresa é obrigatório';
        }
        if (!data.business_info.company_sector) {
          errors.company_sector = 'Setor da empresa é obrigatório';
        }
        if (!data.business_info.annual_revenue) {
          errors.annual_revenue = 'Faturamento anual é obrigatório';
        }
        break;
      
      case 5: // Business Context
        if (!data.business_context.business_model) {
          errors.business_model = 'Modelo de negócio é obrigatório';
        }
        if (!data.business_context.business_challenges?.length) {
          errors.business_challenges = 'Pelo menos um desafio deve ser selecionado';
        }
        break;
      
      case 6: // Goals Info
        if (!data.goals_info.primary_goal) {
          errors.primary_goal = 'Objetivo principal é obrigatório';
        }
        if (!data.goals_info.expected_outcome_30days?.trim()) {
          errors.expected_outcome_30days = 'Resultado esperado em 30 dias é obrigatório';
        }
        break;
      
      case 7: // AI Experience
        if (!data.ai_experience.ai_knowledge_level) {
          errors.ai_knowledge_level = 'Nível de conhecimento em IA é obrigatório';
        }
        if (!data.ai_experience.has_implemented) {
          errors.has_implemented = 'Experiência prévia com IA é obrigatória';
        }
        break;
      
      case 8: // Personalization
        // Sem validações obrigatórias na última etapa
        break;
    }

    setValidationErrors(errors);
    
    const hasErrors = Object.keys(errors).length > 0;
    console.log(`🔍 Validação etapa ${currentStep}:`, {
      hasErrors,
      errors,
      canProceed: !hasErrors
    });
    
    return !hasErrors;
  }, [currentStep, data]);

  // Finalizar onboarding
  const completeOnboarding = useCallback(async (): Promise<CompleteOnboardingResponse> => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    try {
      setIsSubmitting(true);
      console.log('🎯 Finalizando onboarding com dados limpos...', data);

      // Limpar e formatar dados antes de salvar
      const cleanedData = {
        ...data,
        personal_info: {
          ...data.personal_info,
          whatsapp: data.personal_info.whatsapp ? cleanWhatsApp(data.personal_info.whatsapp) : '',
          name: data.personal_info.name?.trim() || '',
          email: data.personal_info.email?.trim() || '',
          // Garantir que gender nunca seja string vazia
          gender: data.personal_info.gender === '' ? undefined : data.personal_info.gender
        },
        business_info: {
          ...data.business_info,
          company_name: data.business_info.company_name?.trim() || '',
          role: data.business_info.role?.trim() || ''
        }
      };

      // Verificar se já está completo
      const { data: existingData } = await supabase
        .from('onboarding_final')
        .select('is_completed')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .maybeSingle();

      if (existingData?.is_completed) {
        console.log('✅ Onboarding já estava completo');
        return { 
          success: true, 
          wasAlreadyCompleted: true,
          data: existingData 
        };
      }

      // Salvar dados finais
      const { data: savedData, error: saveError } = await supabase
        .from('onboarding_final')
        .upsert({
          user_id: user.id,
          is_completed: true,
          completed_at: new Date().toISOString(),
          personal_info: cleanedData.personal_info,
          location_info: cleanedData.location_info,
          discovery_info: cleanedData.discovery_info,
          business_info: cleanedData.business_info,
          business_context: cleanedData.business_context,
          goals_info: cleanedData.goals_info,
          ai_experience: cleanedData.ai_experience,
          personalization: cleanedData.personalization,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (saveError) {
        console.error('❌ Erro ao salvar onboarding final:', saveError);
        return { success: false, error: saveError.message };
      }

      console.log('✅ Onboarding finalizado com sucesso:', savedData);
      
      return { 
        success: true, 
        data: savedData,
        wasAlreadyCompleted: false
      };

    } catch (error: any) {
      console.error('❌ Erro inesperado ao finalizar onboarding:', error);
      return { 
        success: false, 
        error: error.message || 'Erro inesperado ao finalizar onboarding' 
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
    canProceed: canProceed(),
    currentStep,
    totalSteps: TOTAL_STEPS,
    isSubmitting,
    isLoading,
    validationErrors
  };
};
