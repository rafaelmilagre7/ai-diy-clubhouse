
import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { StepQuemEVoceNew } from './steps/StepQuemEVoceNew';
import { StepLocalizacaoRedes } from './steps/StepLocalizacaoRedes';
import { StepComoNosConheceu } from './steps/StepComoNosConheceu';
import { StepSeuNegocio } from './steps/StepSeuNegocio';
import { StepContextoNegocio } from './steps/StepContextoNegocio';
import { StepObjetivosMetas } from './steps/StepObjetivosMetas';
import { StepExperienciaIA } from './steps/StepExperienciaIA';
import { StepPersonalizacaoExperiencia } from './steps/StepPersonalizacaoExperiencia';
import { useIntelligentAutoSave } from '@/hooks/onboarding/useIntelligentAutoSave';
import { useRealtimeValidation } from '@/hooks/onboarding/useRealtimeValidation';
import { useOnboardingProgress } from '@/hooks/onboarding/useOnboardingProgress';
import { EnhancedAutoSaveFeedback } from './EnhancedAutoSaveFeedback';
import { validateStepData } from '@/utils/onboarding/dataMappers';

const TOTAL_STEPS = 8;

const createEmptyData = (): QuickOnboardingData => ({
  // Step 1: Informações pessoais
  name: '',
  email: '',
  whatsapp: '',
  country_code: '+55',
  birth_date: '',
  
  // Step 2: Localização e redes
  country: '',
  state: '',
  city: '',
  timezone: '',
  instagram_url: '',
  linkedin_url: '',
  
  // Step 3: Como nos conheceu
  how_found_us: '',
  referred_by: '',
  
  // Step 4: Negócio
  company_name: '',
  role: '',
  company_size: '',
  company_segment: '',
  company_website: '',
  annual_revenue_range: '',
  current_position: '',
  
  // Step 5: Contexto do negócio
  business_model: '',
  business_challenges: [],
  short_term_goals: [],
  medium_term_goals: [],
  important_kpis: [],
  additional_context: '',
  
  // Step 6: Objetivos
  primary_goal: '',
  expected_outcomes: [],
  expected_outcome_30days: '',
  priority_solution_type: '',
  how_implement: '',
  week_availability: '',
  content_formats: [],
  
  // Step 7: Experiência IA
  ai_knowledge_level: '',
  previous_tools: [],
  has_implemented: '',
  desired_ai_areas: [],
  completed_formation: false,
  is_member_for_month: false,
  nps_score: 0,
  improvement_suggestions: '',
  
  // Step 8: Personalização
  interests: [],
  time_preference: [],
  available_days: [],
  networking_availability: 5,
  skills_to_share: [],
  mentorship_topics: [],
  
  // Campos extras
  live_interest: 5,
  authorize_case_usage: false,
  interested_in_interview: false,
  priority_topics: []
});

export const SimpleOnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingData>(createEmptyData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { loadProgress, completeOnboarding } = useOnboardingProgress();
  
  // Hooks inteligentes com configuração mais conservadora
  const { currentStepValidation } = useRealtimeValidation(data, currentStep);
  const { 
    isSaving, 
    lastSaveTime, 
    hasUnsavedChanges, 
    saveError, 
    saveImmediately,
    retryCount,
    loadFromLocalStorage
  } = useIntelligentAutoSave(data, currentStep, {
    debounceMs: 5000, // Mais conservador - 5 segundos
    maxRetries: 1,
    enableLocalBackup: true
  });

  // Carregar dados salvos ao inicializar
  useEffect(() => {
    const initializeData = async () => {
      console.log('🚀 Inicializando onboarding...');
      
      try {
        // Primeiro tentar carregar do servidor
        const progressData = await loadProgress();
        
        if (progressData && progressData.personal_info?.name) {
          console.log('📊 Carregando dados do servidor...');
          
          // Mapear dados do servidor para o formato Quick
          const loadedData: QuickOnboardingData = {
            ...createEmptyData(),
            name: progressData.personal_info?.name || '',
            email: progressData.personal_info?.email || '',
            whatsapp: progressData.personal_info?.phone || '',
            country_code: progressData.personal_info?.ddi || '+55',
            // ... outros campos mapeados conforme necessário
          };
          
          setData(loadedData);
          
          // Determinar step baseado nos dados salvos
          const savedStep = parseInt(progressData.current_step || '1');
          if (savedStep >= 1 && savedStep <= TOTAL_STEPS) {
            setCurrentStep(savedStep);
          }
        } else {
          // Tentar carregar backup local
          const localBackup = loadFromLocalStorage();
          if (localBackup) {
            console.log('📦 Carregando backup local...');
            setData({ ...createEmptyData(), ...localBackup.data });
            setCurrentStep(localBackup.step);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados salvos');
      } finally {
        setIsInitialized(true);
      }
    };
    
    initializeData();
  }, [loadProgress, loadFromLocalStorage]);

  // Atualizar campo específico
  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    console.log(`📝 Atualizando campo ${field}:`, value);
    setData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('📊 Novos dados:', { [field]: value });
      return newData;
    });
  }, []);

  // Verificar se pode prosseguir
  const canProceed = useCallback(() => {
    try {
      return validateStepData(data, currentStep);
    } catch (error) {
      console.error(`❌ Erro na validação do step ${currentStep}:`, error);
      return false;
    }
  }, [data, currentStep]);

  // Navegar para próximo step
  const handleNext = useCallback(async () => {
    const isValid = canProceed();
    console.log(`🔍 Validação step ${currentStep}:`, isValid);
    
    if (!isValid) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    console.log(`➡️ Avançando do step ${currentStep} para ${currentStep + 1}`);

    // Salvar antes de avançar (apenas se dados válidos)
    if (data.name && data.name.trim().length > 0) {
      const saveSuccess = await saveImmediately();
      if (!saveSuccess) {
        console.log('⚠️ Falha no save, mas continuando...');
        // Não bloquear navegação por falha no save
      }
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Último step - finalizar onboarding
      await handleComplete();
    }
  }, [canProceed, currentStep, saveImmediately, data.name]);

  // Finalizar onboarding
  const handleComplete = useCallback(async () => {
    setIsSubmitting(true);
    console.log('🎯 Iniciando finalização do onboarding');

    try {
      // Salvar dados finais
      const saveSuccess = await saveImmediately();
      if (!saveSuccess) {
        console.log('⚠️ Falha no save final, mas continuando...');
      }

      // Marcar como completo
      const completeSuccess = await completeOnboarding();
      if (!completeSuccess) {
        throw new Error('Falha ao marcar onboarding como completo');
      }

      console.log('✅ Onboarding finalizado com sucesso');
      toast.success('Onboarding concluído com sucesso! 🎉');
      
      // Redirecionar para página de sucesso
      navigate('/onboarding-new/completed');
    } catch (error) {
      console.error('❌ Erro ao finalizar onboarding:', error);
      toast.error('Erro ao finalizar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [saveImmediately, completeOnboarding, navigate]);

  // Props compartilhadas entre steps
  const stepProps = {
    data,
    onUpdate: updateField,
    onNext: handleNext,
    canProceed: canProceed(),
    currentStep,
    totalSteps: TOTAL_STEPS
  };

  // Renderizar step atual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return <StepQuemEVoceNew {...stepProps} />;
      case 2: return <StepLocalizacaoRedes {...stepProps} />;
      case 3: return <StepComoNosConheceu {...stepProps} />;
      case 4: return <StepSeuNegocio {...stepProps} />;
      case 5: return <StepContextoNegocio {...stepProps} />;
      case 6: return <StepObjetivosMetas {...stepProps} />;
      case 7: return <StepExperienciaIA {...stepProps} />;
      case 8: return <StepPersonalizacaoExperiencia {...stepProps} />;
      default: return <StepQuemEVoceNew {...stepProps} />;
    }
  };

  // Mostrar loading até inicializar
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto mb-4"></div>
          <p>Carregando onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Auto-save feedback */}
        <div className="fixed top-4 right-4 z-50">
          <EnhancedAutoSaveFeedback
            isSaving={isSaving}
            lastSaveTime={lastSaveTime}
            hasUnsavedChanges={hasUnsavedChanges}
            saveError={saveError}
            retryCount={retryCount}
          />
        </div>

        {/* Debug info em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded max-w-xs">
            <div>Step: {currentStep}/{TOTAL_STEPS}</div>
            <div>Valid: {canProceed() ? '✅' : '❌'}</div>
            <div>Saving: {isSaving ? '💾' : '✅'}</div>
            <div>Name: {data.name || 'vazio'}</div>
            <div>Email: {data.email || 'vazio'}</div>
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="max-w-4xl mx-auto">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};
