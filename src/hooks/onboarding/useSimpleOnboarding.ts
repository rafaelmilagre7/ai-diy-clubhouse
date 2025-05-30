
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useOnboardingProgress } from './useOnboardingProgress';
import { mapProgressToQuick } from '@/utils/onboarding/dataMappers';
import { validateStepData } from '@/utils/onboarding/dataMappers';
import { useManualSave } from './useManualSave';
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
  const { loadProgress, completeOnboarding } = useOnboardingProgress();
  const { saveManually, isSaving: isSavingManually, loadFromLocalStorage } = useManualSave();
  
  const [data, setData] = useState<QuickOnboardingData>(createEmptyData());
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const totalSteps = 8;

  // Carregar dados salvos ao inicializar
  useEffect(() => {
    const loadSavedData = async () => {
      if (!user?.id) return;
      
      try {
        console.log('🔄 Carregando dados salvos do onboarding...');
        
        // Primeiro tentar carregar do servidor
        const progressData = await loadProgress();
        
        if (progressData) {
          console.log('📊 Dados encontrados no servidor:', progressData);
          const quickData = mapProgressToQuick(progressData);
          const mergedData = { ...createEmptyData(), ...quickData };
          setData(mergedData);
          
          const savedStep = parseInt(progressData.current_step || '1');
          if (savedStep >= 1 && savedStep <= totalSteps) {
            setCurrentStep(savedStep);
          }
          
          console.log('✅ Dados do servidor carregados');
        } else {
          // Se não há dados no servidor, tentar backup local
          const backupData = loadFromLocalStorage();
          if (backupData) {
            console.log('📦 Recuperando dados do backup local');
            const mergedData = { ...createEmptyData(), ...backupData.data };
            setData(mergedData);
            setCurrentStep(backupData.step);
            toast.info('Dados recuperados do backup local');
          } else {
            console.log('📝 Iniciando novo onboarding');
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados salvos:', error);
        
        // Em caso de erro, tentar backup local
        const backupData = loadFromLocalStorage();
        if (backupData) {
          console.log('📦 Usando backup local devido a erro');
          const mergedData = { ...createEmptyData(), ...backupData.data };
          setData(mergedData);
          setCurrentStep(backupData.step);
          toast.info('Dados recuperados do backup local');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedData();
  }, [user?.id, loadProgress, loadFromLocalStorage]);

  const updateField = useCallback((field: keyof QuickOnboardingData, value: string | string[] | number | boolean) => {
    console.log(`📝 Atualizando campo ${field}:`, value);
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Validação
  const canProceed = useCallback(() => {
    try {
      return validateStepData(data, currentStep);
    } catch (error) {
      console.error(`❌ Erro na validação do step ${currentStep}:`, error);
      return false;
    }
  }, [data, currentStep]);

  // Avançar step com save manual
  const nextStep = useCallback(async () => {
    if (!canProceed()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    console.log(`➡️ Salvando e avançando do step ${currentStep} para ${currentStep + 1}`);
    
    // Salvar progresso antes de avançar
    const saveSuccess = await saveManually(data, currentStep);
    
    if (saveSuccess && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else if (!saveSuccess) {
      // Mesmo com falha no save, permitir navegação (dados estão no backup local)
      console.log('⚠️ Save falhou, mas permitindo navegação com backup local');
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      }
    }
  }, [currentStep, totalSteps, canProceed, saveManually, data]);

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
      console.log('🎯 Finalizando onboarding...');
      
      // Salvar dados finais
      const saveSuccess = await saveManually(data, currentStep);
      
      if (saveSuccess) {
        // Marcar como completo
        const completeSuccess = await completeOnboarding();
        if (completeSuccess) {
          console.log('✅ Onboarding concluído com sucesso!');
          return true;
        }
      }
      
      throw new Error('Falha ao finalizar onboarding');
    } catch (error) {
      console.error('❌ Erro ao completar onboarding:', error);
      toast.error('Erro ao finalizar onboarding. Tente novamente.');
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [user?.id, data, currentStep, saveManually, completeOnboarding]);

  return {
    data,
    currentStep,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding: handleCompleteOnboarding,
    canProceed: canProceed(),
    totalSteps,
    isSaving: isSavingManually,
    isCompleting,
    isLoading
  };
};
