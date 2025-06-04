import React, { useState } from 'react';
import { useQuickOnboardingOptimized } from '@/hooks/onboarding/useQuickOnboardingOptimized';
import { useNavigate } from 'react-router-dom';
import { LazyStepLoader } from './steps/LazyStepLoader';
import { ModernFinalizationScreen } from './ModernFinalizationScreen';
import { ModernSuccessScreen } from './ModernSuccessScreen';
import { OnboardingReadOnlyView } from './OnboardingReadOnlyView';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const UnifiedOnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  
  const {
    currentStep,
    data,
    updateField,
    nextStep,
    previousStep,
    isLoading,
    hasExistingData,
    loadError,
    totalSteps,
    isSaving,
    lastSaveTime: rawLastSaveTime,
    completeOnboarding,
    isCompleted,
    retryCount,
    canProceed,
    canFinalize
  } = useQuickOnboardingOptimized();

  // Normalize lastSaveTime to ensure it's always number | null
  const lastSaveTime = typeof rawLastSaveTime === 'number' ? rawLastSaveTime : rawLastSaveTime?.getTime?.() ?? null;

  const handleFinish = async () => {
    if (isCompleting) return;

    if (!canFinalize) {
      toast.error('Complete todos os campos obrigatórios antes de finalizar', {
        duration: 3000
      });
      return;
    }
    
    setIsCompleting(true);
    
    try {
      const loadingToast = toast.loading('Finalizando seu onboarding...', {
        duration: 0
      });
      
      const success = await completeOnboarding();
      
      toast.dismiss(loadingToast);
      
      if (success) {
        toast.success('Onboarding concluído com sucesso!', {
          duration: 2000
        });
        
        setTimeout(() => {
          setShowSuccessScreen(true);
          setIsCompleting(false);
        }, 1500);
      } else {
        const retryMessage = retryCount > 0 ? ` (${retryCount}/3 tentativas)` : '';
        toast.error(`Erro ao finalizar onboarding${retryMessage}. Verifique os dados e tente novamente.`, {
          duration: 5000
        });
        setIsCompleting(false);
      }
    } catch (error) {
      console.error('Erro na finalização:', error);
      toast.error('Erro inesperado ao finalizar onboarding. Tente novamente.', {
        duration: 5000
      });
      setIsCompleting(false);
    }
  };

  const handleNavigateFromSuccess = (path: string) => {
    navigate(path);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 text-viverblue animate-spin" />
        <p className="text-gray-300">Carregando seus dados...</p>
      </div>
    );
  }

  // Error state (ignorar erros de onboarding_completed)
  if (loadError && !loadError.includes('onboarding_completed')) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="flex items-center justify-center gap-2 text-red-400 mb-4">
          <AlertTriangle className="h-6 w-6" />
          <p className="text-lg font-medium">Erro no Carregamento</p>
        </div>
        <p className="text-red-400">⚠️ {loadError}</p>
        <p className="text-gray-300">Você pode continuar com dados em branco.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-viverblue text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  // Se onboarding está concluído, mostrar visualização readonly
  if (isCompleted && !showSuccessScreen) {
    return <OnboardingReadOnlyView data={data} />;
  }

  // Tela de sucesso após finalização
  if (showSuccessScreen) {
    return <ModernSuccessScreen onNavigate={handleNavigateFromSuccess} />;
  }

  // Indicador de dados carregados
  const showDataLoadedMessage = hasExistingData && currentStep === 1 && !isCompleted;

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
      case 2:
      case 3:
        return (
          <div className="space-y-4">
            {showDataLoadedMessage && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                <p className="text-green-400 text-sm flex items-center gap-2">
                  ✅ Dados anteriores carregados com sucesso! Você pode revisar e continuar.
                </p>
              </div>
            )}
            <LazyStepLoader
              step={currentStep}
              data={data}
              onUpdate={updateField}
              onNext={nextStep}
              onPrevious={previousStep}
              canProceed={canProceed}
              currentStep={currentStep}
              totalSteps={totalSteps}
              isSaving={isSaving}
              lastSaveTime={lastSaveTime}
            />
          </div>
        );
      
      case 4:
        if (!canFinalize) {
          return (
            <div className="text-center py-12 space-y-4">
              <div className="flex items-center justify-center gap-2 text-yellow-400 mb-4">
                <AlertTriangle className="h-6 w-6" />
                <p className="text-lg font-medium">Etapas Anteriores Incompletas</p>
              </div>
              <p className="text-gray-300">
                Complete todas as etapas anteriores antes de finalizar o onboarding.
              </p>
            </div>
          );
        }

        return (
          <ModernFinalizationScreen
            isCompleting={isCompleting}
            retryCount={retryCount}
            onFinish={handleFinish}
            canFinalize={canFinalize}
          />
        );
      
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-400">Etapa não encontrada</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderCurrentStep()}
    </div>
  );
};
