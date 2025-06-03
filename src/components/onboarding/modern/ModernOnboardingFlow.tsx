
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuickOnboarding } from '@/hooks/onboarding/useQuickOnboarding';
import { StepQuemEVoce } from './steps/StepQuemEVoce';
import { StepSeuNegocio } from './steps/StepSeuNegocio';
import { StepExperienciaIA } from './steps/StepExperienciaIA';
import { TrailMagicExperience } from '../TrailMagicExperience';
import MilagrinhoAssistant from '../MilagrinhoAssistant';

export const ModernOnboardingFlow: React.FC = () => {
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
  } = useQuickOnboarding();

  const handleFinish = async () => {
    const success = await completeOnboarding();
    if (success) {
      navigate('/onboarding/completed');
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepQuemEVoce
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
          <StepSeuNegocio
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
          <StepExperienciaIA
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
