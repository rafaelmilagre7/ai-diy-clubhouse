
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useOnboardingProgress } from './useOnboardingProgress';
import { mapQuickToProgress, mapProgressToQuick } from '@/utils/onboarding/dataMappers';
import { validateStepData } from '@/utils/onboarding/dataMappers';
import { toast } from 'sonner';

const createEmptyData = (): QuickOnboardingData => ({
  // Etapa 1
  name: '',
  email: '',
  whatsapp: '',
  country_code: '+55',
  birth_date: '',
  
  // Etapa 2
  country: '',
  state: '',
  city: '',
  timezone: '',
  instagram_url: '',
  linkedin_url: '',
  
  // Etapa 3
  how_found_us: '',
  referred_by: '',
  
  // Etapa 4
  company_name: '',
  role: '',
  company_size: '',
  company_segment: '',
  company_website: '',
  annual_revenue_range: '',
  current_position: '',
  
  // Etapa 5
  business_model: '',
  business_challenges: [],
  short_term_goals: [],
  medium_term_goals: [],
  important_kpis: [],
  additional_context: '',
  
  // Etapa 6
  primary_goal: '',
  expected_outcomes: [],
  expected_outcome_30days: '',
  priority_solution_type: '',
  how_implement: '',
  week_availability: '',
  content_formats: [],
  
  // Etapa 7
  ai_knowledge_level: '',
  previous_tools: [],
  has_implemented: '',
  desired_ai_areas: [],
  completed_formation: false,
  is_member_for_month: false,
  nps_score: 0,
  improvement_suggestions: '',
  
  // Etapa 8
  interests: [],
  time_preference: [],
  available_days: [],
  networking_availability: 0,
  skills_to_share: [],
  mentorship_topics: [],
  
  // Controle
  live_interest: 0,
  authorize_case_usage: false,
  interested_in_interview: false,
  priority_topics: []
});

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const { loadProgress, saveProgress, completeOnboarding } = useOnboardingProgress();
  
  const [data, setData] = useState<QuickOnboardingData>(createEmptyData());
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const totalSteps = 8;

  // Carregar dados salvos ao inicializar
  useEffect(() => {
    const loadSavedData = async () => {
      if (!user?.id) return;
      
      try {
        console.log('🔄 Carregando dados salvos do onboarding...');
        const progressData = await loadProgress();
        
        if (progressData) {
          console.log('📊 Dados encontrados, convertendo para formato Quick:', progressData);
          const quickData = mapProgressToQuick(progressData);
          
          // Merge com dados vazios para garantir que todos os campos existem
          const mergedData = { ...createEmptyData(), ...quickData };
          setData(mergedData);
          
          // Determinar step baseado nos dados salvos
          const savedStep = parseInt(progressData.current_step || '1');
          if (savedStep >= 1 && savedStep <= totalSteps) {
            setCurrentStep(savedStep);
          }
          
          console.log('✅ Dados carregados e aplicados');
        } else {
          console.log('📝 Nenhum progresso salvo encontrado, iniciando novo onboarding');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados salvos:', error);
        toast.error('Erro ao carregar dados salvos');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedData();
  }, [user?.id]);

  // Auto-save quando dados mudam (com debounce)
  useEffect(() => {
    if (!user?.id || isLoading) return;
    
    const timeoutId = setTimeout(async () => {
      if (data.name || data.email) { // Só salva se tem dados mínimos
        await autoSave();
      }
    }, 2000); // Debounce de 2 segundos
    
    return () => clearTimeout(timeoutId);
  }, [data, currentStep, user?.id, isLoading]);

  const autoSave = async () => {
    if (!user?.id || isSaving) return;
    
    try {
      setIsSaving(true);
      const progressData = mapQuickToProgress(data);
      progressData.current_step = currentStep.toString();
      
      await saveProgress(progressData);
      console.log('💾 Auto-save realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no auto-save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = useCallback((field: keyof QuickOnboardingData, value: string | string[] | number | boolean) => {
    console.log(`📝 Atualizando campo ${field}:`, value);
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Validação mais flexível e robusta
  const canProceed = useCallback(() => {
    try {
      return validateStepData(data, currentStep);
    } catch (error) {
      console.error(`❌ Erro na validação do step ${currentStep}:`, error);
      return false;
    }
  }, [data, currentStep]);

  const nextStep = useCallback(async () => {
    if (!canProceed()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    console.log(`➡️ Avançando do step ${currentStep} para ${currentStep + 1}`);
    
    // Salvar progresso antes de avançar
    await autoSave();
    
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps, canProceed, autoSave]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      console.log(`⬅️ Voltando do step ${currentStep} para ${currentStep - 1}`);
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleCompleteOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      setIsCompleting(true);
      console.log('🎯 Iniciando conclusão do onboarding...');
      
      // Salvar dados finais
      const progressData = mapQuickToProgress(data);
      progressData.current_step = 'completed';
      progressData.is_completed = true;
      
      const saveSuccess = await saveProgress(progressData);
      if (!saveSuccess) {
        throw new Error('Falha ao salvar dados finais');
      }
      
      // Marcar como completo
      const completeSuccess = await completeOnboarding();
      if (!completeSuccess) {
        throw new Error('Falha ao marcar onboarding como completo');
      }
      
      console.log('✅ Onboarding concluído com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao completar onboarding:', error);
      toast.error('Erro ao finalizar onboarding. Tente novamente.');
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [user?.id, data, saveProgress, completeOnboarding]);

  return {
    data,
    currentStep,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding: handleCompleteOnboarding,
    canProceed: canProceed(),
    totalSteps,
    isSaving,
    isCompleting,
    isLoading
  };
};
