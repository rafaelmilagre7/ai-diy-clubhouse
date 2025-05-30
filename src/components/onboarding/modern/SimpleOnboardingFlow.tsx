
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
import { useOnboardingDebug } from '@/hooks/onboarding/useOnboardingDebug';
import { useOnboardingProgress } from '@/hooks/onboarding/useOnboardingProgress';
import { EnhancedAutoSaveFeedback } from './EnhancedAutoSaveFeedback';
import { mapQuickToProgress } from '@/utils/onboarding/dataMappers';

const TOTAL_STEPS = 8;

const initialData: QuickOnboardingData = {
  // Step 1: Informações pessoais
  name: '',
  email: '',
  whatsapp: '',
  country_code: '',
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
};

export const SimpleOnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { completeOnboarding } = useOnboardingProgress();
  
  // Hooks inteligentes
  const { currentStepValidation } = useRealtimeValidation(data, currentStep);
  const { 
    isSaving, 
    lastSaveTime, 
    hasUnsavedChanges, 
    saveError, 
    saveImmediately,
    retryCount 
  } = useIntelligentAutoSave(data, currentStep);
  
  const { addDebugEvent, isDebugMode } = useOnboardingDebug(data, currentStep);

  // Atualizar campo específico
  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      addDebugEvent('user_action', `Campo ${field} atualizado`, { field, value, step: currentStep });
      return newData;
    });
  }, [addDebugEvent, currentStep]);

  // Verificar se pode prosseguir
  const canProceed = currentStepValidation.isValid;

  // Navegar para próximo step
  const handleNext = useCallback(async () => {
    if (!canProceed) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      addDebugEvent('validation', 'Tentativa de avançar com dados inválidos', currentStepValidation.errors);
      return;
    }

    addDebugEvent('navigation', `Avançando do step ${currentStep} para ${currentStep + 1}`);

    // Salvar antes de avançar
    const saveSuccess = await saveImmediately();
    if (!saveSuccess) {
      toast.error('Erro ao salvar. Tente novamente.');
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
      toast.success('Progresso salvo!');
    } else {
      // Último step - finalizar onboarding
      await handleComplete();
    }
  }, [canProceed, currentStep, saveImmediately, addDebugEvent, currentStepValidation.errors]);

  // Finalizar onboarding
  const handleComplete = useCallback(async () => {
    setIsSubmitting(true);
    addDebugEvent('user_action', 'Iniciando finalização do onboarding');

    try {
      // Salvar dados finais
      const saveSuccess = await saveImmediately();
      if (!saveSuccess) {
        throw new Error('Falha ao salvar dados finais');
      }

      // Marcar como completo
      const completeSuccess = await completeOnboarding();
      if (!completeSuccess) {
        throw new Error('Falha ao marcar onboarding como completo');
      }

      addDebugEvent('user_action', 'Onboarding finalizado com sucesso');
      toast.success('Onboarding concluído com sucesso! 🎉');
      
      // Redirecionar para página de sucesso
      navigate('/onboarding-new/completed');
    } catch (error) {
      console.error('Erro ao finalizar onboarding:', error);
      addDebugEvent('error', 'Erro ao finalizar onboarding', error);
      toast.error('Erro ao finalizar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [saveImmediately, completeOnboarding, navigate, addDebugEvent]);

  // Props compartilhadas entre steps
  const stepProps = {
    data,
    onUpdate: updateField,
    onNext: handleNext,
    canProceed,
    currentStep,
    totalSteps: TOTAL_STEPS
  };

  // Renderizar step atual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <StepQuemEVoceNew {...stepProps} />;
      case 2:
        return <StepLocalizacaoRedes {...stepProps} />;
      case 3:
        return <StepComoNosConheceu {...stepProps} />;
      case 4:
        return <StepSeuNegocio {...stepProps} />;
      case 5:
        return <StepContextoNegocio {...stepProps} />;
      case 6:
        return <StepObjetivosMetas {...stepProps} />;
      case 7:
        return <StepExperienciaIA {...stepProps} />;
      case 8:
        return <StepPersonalizacaoExperiencia {...stepProps} />;
      default:
        return <StepQuemEVoceNew {...stepProps} />;
    }
  };

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

        {/* Debug info (apenas em modo debug) */}
        {isDebugMode && (
          <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded">
            <div>Step: {currentStep}/{TOTAL_STEPS}</div>
            <div>Valid: {canProceed ? '✅' : '❌'}</div>
            <div>Saving: {isSaving ? '💾' : '✅'}</div>
            <div>Progress: {currentStepValidation.completionPercentage}%</div>
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
