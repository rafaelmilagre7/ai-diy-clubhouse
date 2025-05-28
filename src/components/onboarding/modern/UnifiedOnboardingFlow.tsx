
import React from 'react';
import { useOnboardingUnified } from '@/hooks/onboarding/useOnboardingUnified';
import { useOnboardingNavigation } from '@/hooks/onboarding/useOnboardingNavigation';
import { LazyStepLoader } from './steps/LazyStepLoader';
import { EnhancedTrailMagicExperience } from '../EnhancedTrailMagicExperience';
import MilagrinhoAssistant from '../MilagrinhoAssistant';
import { Loader2 } from 'lucide-react';

export const UnifiedOnboardingFlow: React.FC = () => {
  const {
    currentStep,
    data,
    updateField,
    nextStep,
    previousStep,
    canProceed,
    isSubmitting,
    completeOnboarding,
    totalSteps,
    isLoading,
    hasExistingData,
    loadError
  } = useOnboardingUnified();

  const { navigateToStep } = useOnboardingNavigation();

  const handleFinish = async () => {
    const success = await completeOnboarding();
    // Auto-redirect já está implementado no hook
  };

  // Mostrar loading enquanto carrega dados existentes
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 text-viverblue animate-spin" />
        <p className="text-gray-300">Carregando seus dados...</p>
      </div>
    );
  }

  // Mostrar erro se houver problema no carregamento
  if (loadError) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-red-400">⚠️ {loadError}</p>
        <p className="text-gray-300">Você pode continuar com dados em branco.</p>
      </div>
    );
  }

  // Mostrar indicador se dados foram carregados
  const showDataLoadedMessage = hasExistingData && currentStep === 1;

  // Garantir que canProceed seja sempre boolean
  const canProceedBoolean = typeof canProceed === 'function' ? canProceed() : Boolean(canProceed);

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
              canProceed={canProceedBoolean}
              currentStep={currentStep}
              totalSteps={totalSteps}
            />
          </div>
        );
      
      case 4:
        return (
          <div className="animate-fade-in">
            <MilagrinhoAssistant
              userName={data.name.split(' ')[0]}
              message="Excelente! Agora vou criar sua trilha personalizada de implementação de IA com base no seu perfil. Este é o momento mágico! ✨"
            />
            <EnhancedTrailMagicExperience onFinish={handleFinish} />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="py-4">
      {renderCurrentStep()}
    </div>
  );
};
