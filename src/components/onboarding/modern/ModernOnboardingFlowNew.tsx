
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuickOnboardingNew } from '@/hooks/onboarding/useQuickOnboardingNew';
import { StepQuemEVoceNew } from './steps/StepQuemEVoceNew';
import { StepSeuNegocioNew } from './steps/StepSeuNegocioNew';
import { StepExperienciaIANew } from './steps/StepExperienciaIANew';
import { TrailMagicExperience } from '../TrailMagicExperience';
import MilagrinhoAssistant from '../MilagrinhoAssistant';

export const ModernOnboardingFlowNew: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    data,
    updateField,
    nextStep,
    previousStep,
    canProceed,
    isSubmitting,
    completeOnboarding,
    totalSteps
  } = useQuickOnboardingNew();

  const handleFinish = async () => {
    const success = await completeOnboarding();
    // Auto-redirect já está implementado no hook
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepQuemEVoceNew
            data={data}
            onUpdate={updateField}
            onNext={nextStep}
            canProceed={canProceed}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        );
      
      case 2:
        return (
          <StepSeuNegocioNew
            data={data}
            onUpdate={updateField}
            onNext={nextStep}
            onPrevious={previousStep}
            canProceed={canProceed}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        );
      
      case 3:
        return (
          <StepExperienciaIANew
            data={data}
            onUpdate={updateField}
            onNext={nextStep}
            onPrevious={previousStep}
            canProceed={canProceed}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        );
      
      case 4:
        return (
          <div className="animate-fade-in">
            <MilagrinhoAssistant
              userName={data.name.split(' ')[0]}
              message="Excelente! Agora vou criar sua trilha personalizada de implementação de IA com base no seu perfil. Este é o momento mágico! ✨"
            />
            <TrailMagicExperience onFinish={handleFinish} />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F111A] to-[#161A2C] py-8">
      <div className="container mx-auto px-4">
        {renderCurrentStep()}
      </div>
    </div>
  );
};
