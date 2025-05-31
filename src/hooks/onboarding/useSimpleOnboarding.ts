
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useQuickOnboarding } from './useQuickOnboarding';
import { useIntelligentAutoSave } from './useIntelligentAutoSave';

const TOTAL_STEPS = 8;

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
  priority_topics: []
});

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingData>(getInitialData);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const {
    data: savedData,
    completeOnboarding: completeOnboardingData,
    isLoading: quickOnboardingLoading,
    error: quickOnboardingError
  } = useQuickOnboarding();

  // Auto-save inteligente com configuração menos agressiva
  const { 
    isSaving, 
    saveImmediately 
  } = useIntelligentAutoSave(data, currentStep, {
    debounceMs: 5000, // Aumentado para 5 segundos
    maxRetries: 1, // Reduzido tentativas
    enableLocalBackup: true
  });

  // Carregar dados salvos
  useEffect(() => {
    if (savedData && Object.keys(savedData).length > 0) {
      console.log('📥 Carregando dados salvos:', savedData);
      
      // Mesclar dados salvos com dados iniciais, priorizando dados salvos
      const mergedData = {
        ...getInitialData(),
        ...savedData,
        // Garantir que campos obrigatórios tenham valores válidos
        name: savedData.name || '',
        email: savedData.email || user?.email || '',
        country_code: savedData.country_code || '+55'
      };
      
      setData(mergedData);
      // Usar currentStep do banco se existir, senão usar 1
      if (savedData.currentStep) {
        setCurrentStep(parseInt(savedData.currentStep.toString()));
      }
    } else if (user?.email) {
      // Se não há dados salvos, inicializar com email do usuário
      setData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
  }, [savedData, user?.email]);

  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    console.log(`📝 Atualizando campo ${field}:`, value);
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const nextStep = useCallback(async () => {
    if (currentStep < TOTAL_STEPS) {
      console.log(`➡️ Avançando para etapa ${currentStep + 1}`);
      
      // Salvar dados antes de avançar
      try {
        await saveImmediately();
        setCurrentStep(prev => prev + 1);
      } catch (error) {
        console.error('❌ Erro ao salvar antes de avançar:', error);
        // Continuar mesmo com erro de save (dados ficam no localStorage)
        setCurrentStep(prev => prev + 1);
      }
    }
  }, [currentStep, saveImmediately]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      console.log(`⬅️ Voltando para etapa ${currentStep - 1}`);
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    setIsCompleting(true);
    try {
      console.log('🏁 Completando onboarding...');
      
      const success = await completeOnboardingData(data);
      if (success) {
        console.log('✅ Onboarding completado com sucesso');
        return true;
      } else {
        console.error('❌ Falha ao completar onboarding');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao completar onboarding:', error);
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [data, completeOnboardingData]);

  // Validação de step - retorna boolean diretamente
  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 1: // Informações pessoais
        return !!(data.name && data.name.length >= 2);
      case 2: // Localização
        return !!(data.country && data.state && data.city);
      case 3: // Como conheceu
        return !!(data.how_found_us && (data.how_found_us !== 'indicacao' || data.referred_by));
      case 4: // Negócio
        return !!(data.company_name && data.role && data.company_size && data.company_segment);
      case 5: // Contexto do negócio
        return !!data.business_model;
      case 6: // Objetivos
        return !!(data.primary_goal && data.expected_outcome_30days);
      case 7: // Experiência com IA
        return !!(data.ai_knowledge_level && data.ai_knowledge_level !== '0' && data.has_implemented);
      case 8: // Personalização
        return !!(data.content_formats && data.content_formats.length > 0 && data.available_days && data.available_days.length > 0);
      default:
        return false;
    }
  }, [currentStep, data]);

  return {
    data,
    currentStep,
    totalSteps: TOTAL_STEPS,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed: canProceed(), // Chama a função para retornar boolean
    isSaving,
    isCompleting,
    isLoading: quickOnboardingLoading,
    error: quickOnboardingError
  };
};
