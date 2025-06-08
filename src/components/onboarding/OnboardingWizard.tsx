
import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useOnboardingWizard } from '@/hooks/onboarding/useOnboardingWizard';
import { useOnboardingData } from '@/hooks/onboarding/useOnboardingData';
import { OnboardingWizardProps, OnboardingStepType } from '@/types/onboardingTypes';
import { ProgressBar } from './components/ProgressBar';
import { StepNavigation } from './components/StepNavigation';
import { WelcomeStep } from './steps/WelcomeStep';
import { ProfileStep } from './steps/ProfileStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { GoalsStep } from './steps/GoalsStep';
import { CompletionStep } from './steps/CompletionStep';
import { toast } from 'sonner';

/**
 * Componente principal do wizard de onboarding
 * FASE 3: Sistema completo de steps interativos
 */
export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onSkip }) => {
  const wizard = useOnboardingWizard();
  const { saveOnboardingData, skipOnboardingData, isSaving } = useOnboardingData();

  const stepTypes: OnboardingStepType[] = ['welcome', 'profile', 'preferences', 'goals', 'completion'];
  const currentStepType = stepTypes[wizard.currentStep];

  // Atualizar dados do step atual
  const handleStepDataChange = useCallback((stepData: any) => {
    wizard.updateStepData(currentStepType, stepData);
  }, [wizard, currentStepType]);

  // Próximo step
  const handleNext = useCallback(() => {
    if (wizard.validateCurrentStep()) {
      wizard.nextStep();
    }
  }, [wizard]);

  // Step anterior
  const handlePrevious = useCallback(() => {
    wizard.previousStep();
  }, [wizard]);

  // Completar onboarding
  const handleComplete = useCallback(async () => {
    try {
      const success = await saveOnboardingData(wizard.data);
      if (success) {
        wizard.completeOnboarding();
        await onComplete(wizard.data);
        toast.success('Setup concluído com sucesso! 🎉');
      }
    } catch (error) {
      console.error('❌ Erro ao completar onboarding:', error);
      toast.error('Erro ao salvar configurações. Tente novamente.');
    }
  }, [wizard, saveOnboardingData, onComplete]);

  // Pular onboarding
  const handleSkip = useCallback(async () => {
    try {
      await skipOnboardingData();
      wizard.skipOnboarding();
      if (onSkip) {
        await onSkip();
      }
      toast.info('Setup pulado. Você pode configurar depois no seu perfil.');
    } catch (error) {
      console.error('❌ Erro ao pular onboarding:', error);
      toast.error('Erro ao pular setup. Tente novamente.');
    }
  }, [wizard, skipOnboardingData, onSkip]);

  // Renderizar step atual
  const renderCurrentStep = () => {
    const stepData = wizard.data[currentStepType] || {};

    switch (currentStepType) {
      case 'welcome':
        return <WelcomeStep onDataChange={handleStepDataChange} data={stepData} />;
      case 'profile':
        return <ProfileStep onDataChange={handleStepDataChange} data={stepData} />;
      case 'preferences':
        return <PreferencesStep onDataChange={handleStepDataChange} data={stepData} />;
      case 'goals':
        return <GoalsStep onDataChange={handleStepDataChange} data={stepData} />;
      case 'completion':
        return <CompletionStep onDataChange={handleStepDataChange} data={stepData} />;
      default:
        return <div>Step não encontrado</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header com progresso */}
        <div className="mb-8">
          <ProgressBar 
            currentStep={wizard.currentStep}
            totalSteps={wizard.totalSteps}
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Conteúdo do step */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            {renderCurrentStep()}

            {/* Navegação */}
            <StepNavigation
              canGoPrevious={wizard.canGoPrevious}
              canGoNext={wizard.canGoNext}
              isLastStep={wizard.currentStep === wizard.totalSteps - 1}
              isLoading={isSaving}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSkip={currentStepType !== 'completion' ? handleSkip : undefined}
              onComplete={wizard.currentStep === wizard.totalSteps - 1 ? handleComplete : undefined}
            />
          </CardContent>
        </Card>

        {/* Informações adicionais */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            Todas as informações são opcionais e podem ser alteradas posteriormente em seu perfil.
          </p>
        </div>
      </div>
    </div>
  );
};
