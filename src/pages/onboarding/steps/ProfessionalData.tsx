
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ProfessionalDataStep } from "@/components/onboarding/steps/ProfessionalDataStep";

const ProfessionalData = () => {
  const {
    currentStepIndex,
    steps,
    isSubmitting,
    saveStepData,
    progress
  } = useOnboardingSteps();

  // Função para calcular o progresso
  const progressPercentage = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <OnboardingLayout
      currentStep={currentStepIndex + 1}
      totalSteps={steps.length}
      progress={progressPercentage}
      title="Dados Profissionais"
    >
      <ProfessionalDataStep
        onSubmit={saveStepData}
        isSubmitting={isSubmitting}
        isLastStep={false}
        onComplete={() => {}}
        initialData={progress}
        personalInfo={progress?.personal_info}
      />
    </OnboardingLayout>
  );
};

export default ProfessionalData;
