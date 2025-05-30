
import React from 'react';
import { useSimpleOnboarding } from '@/hooks/onboarding/useSimpleOnboarding';
import { useIntelligentAutoSave } from '@/hooks/onboarding/useIntelligentAutoSave';
import { useRealtimeValidation } from '@/hooks/onboarding/useRealtimeValidation';
import { useOnboardingDebug } from '@/hooks/onboarding/useOnboardingDebug';
import { useNavigate } from 'react-router-dom';
import { EnhancedAutoSaveFeedback } from './EnhancedAutoSaveFeedback';
import { StepQuemEVoceNew } from './steps/StepQuemEVoceNew';
import { StepLocalizacaoRedes } from './steps/StepLocalizacaoRedes';
import { StepComoNosConheceu } from './steps/StepComoNosConheceu';
import { StepSeuNegocioNew } from './steps/StepSeuNegocioNew';
import { StepContextoNegocio } from './steps/StepContextoNegocio';
import { StepObjetivosMetas } from './steps/StepObjetivosMetas';
import { StepExperienciaIANew } from './steps/StepExperienciaIANew';
import { StepPersonalizacaoExperiencia } from './steps/StepPersonalizacaoExperiencia';
import { EnhancedTrailMagicExperience } from '../EnhancedTrailMagicExperience';
import { Loader2, Bug } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export const SimpleOnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const {
    data,
    currentStep,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed,
    totalSteps,
    isCompleting,
    isLoading
  } = useSimpleOnboarding();

  // Auto-save inteligente
  const {
    isSaving,
    lastSaveTime,
    hasUnsavedChanges,
    saveError,
    saveImmediately,
    retryCount
  } = useIntelligentAutoSave(data, currentStep);

  // Validação em tempo real
  const { currentStepValidation, overallProgress } = useRealtimeValidation(data, currentStep);

  // Debug
  const {
    isDebugMode,
    debugEvents,
    addDebugEvent,
    toggleDebugMode,
    exportDebugLogs
  } = useOnboardingDebug(data, currentStep);

  const handleNextStep = async () => {
    addDebugEvent('user_action', 'Tentativa de avançar step', { 
      isValid: currentStepValidation.isValid,
      errors: currentStepValidation.errors 
    });

    if (!currentStepValidation.isValid) {
      addDebugEvent('validation', 'Validação falhou ao tentar avançar', currentStepValidation.errors);
      return;
    }

    // Salvar antes de avançar
    const saveSuccess = await saveImmediately();
    if (!saveSuccess) {
      addDebugEvent('error', 'Falha ao salvar antes de avançar step');
      return;
    }

    addDebugEvent('save', 'Dados salvos com sucesso antes de avançar');
    nextStep();
  };

  const handleFinish = async () => {
    addDebugEvent('user_action', 'Tentativa de finalizar onboarding');
    
    const success = await completeOnboarding();
    if (success) {
      addDebugEvent('save', 'Onboarding concluído com sucesso');
      navigate('/onboarding-new/completed');
    } else {
      addDebugEvent('error', 'Falha ao finalizar onboarding');
    }
  };

  const handleMagicFinish = () => {
    addDebugEvent('user_action', 'Experiência mágica finalizada');
    navigate('/onboarding-new/completed');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-viverblue animate-spin mx-auto mb-4" />
          <p className="text-white">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    const stepProps = {
      data,
      onUpdate: updateField,
      onNext: currentStep === 8 ? handleFinish : handleNextStep,
      onPrevious: previousStep,
      canProceed: currentStepValidation.isValid,
      currentStep,
      totalSteps
    };

    switch (currentStep) {
      case 1:
        return <StepQuemEVoceNew {...stepProps} />;
      case 2:
        return <StepLocalizacaoRedes {...stepProps} />;
      case 3:
        return <StepComoNosConheceu {...stepProps} />;
      case 4:
        return <StepSeuNegocioNew {...stepProps} />;
      case 5:
        return <StepContextoNegocio {...stepProps} />;
      case 6:
        return <StepObjetivosMetas {...stepProps} />;
      case 7:
        return <StepExperienciaIANew {...stepProps} />;
      case 8:
        return <StepPersonalizacaoExperiencia {...stepProps} />;
      case 9:
        return (
          <motion.div 
            className="animate-fade-in"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <EnhancedTrailMagicExperience onFinish={handleMagicFinish} />
          </motion.div>
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-400">Etapa não encontrada: {currentStep}</p>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {/* Debug Panel */}
      {isDebugMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 z-50 bg-gray-900/95 backdrop-blur-sm p-4 rounded-lg border border-gray-700 max-w-sm"
        >
          <div className="text-xs text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Debug Mode</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleDebugMode}
                className="h-6 px-2 text-xs"
              >
                Fechar
              </Button>
            </div>
            <div>Step: {currentStep}/{totalSteps}</div>
            <div>Progresso: {overallProgress}%</div>
            <div>Eventos: {debugEvents.length}</div>
            <div>
              Validação: {currentStepValidation.isValid ? '✅' : '❌'} 
              ({currentStepValidation.completionPercentage}%)
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={exportDebugLogs}
              className="w-full h-6 text-xs"
            >
              Exportar Logs
            </Button>
          </div>
        </motion.div>
      )}

      {/* Debug Toggle Button */}
      {!isDebugMode && (
        <button
          onClick={toggleDebugMode}
          className="fixed bottom-4 right-4 z-40 p-2 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-600 transition-colors"
          title="Ativar modo debug"
        >
          <Bug className="w-4 h-4 text-gray-400" />
        </button>
      )}

      {/* Auto-save Feedback */}
      <div className="fixed top-4 left-4 z-40">
        <EnhancedAutoSaveFeedback
          isSaving={isSaving}
          lastSaveTime={lastSaveTime}
          hasUnsavedChanges={hasUnsavedChanges}
          saveError={saveError}
          retryCount={retryCount}
          onRetry={saveImmediately}
        />
      </div>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <div className="h-1 bg-gray-800">
          <motion.div
            className="h-full bg-viverblue"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Overlay de carregamento durante conclusão */}
      {isCompleting && (
        <motion.div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gray-800 rounded-lg p-6 space-y-4 border border-gray-700">
            <Loader2 className="h-8 w-8 text-viverblue animate-spin mx-auto" />
            <p className="text-white text-center font-medium">
              Finalizando onboarding...
            </p>
            <p className="text-gray-400 text-center text-sm">
              Preparando sua experiência personalizada
            </p>
          </div>
        </motion.div>
      )}

      {/* Conteúdo principal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="pt-4"
      >
        {renderCurrentStep()}
      </motion.div>
    </div>
  );
};
