
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ProfessionalDataStep } from "@/components/onboarding/steps/ProfessionalDataStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";

const ProfessionalData = () => {
  const { saveStepData, progress, completeOnboarding } = useOnboardingSteps();

  return (
    <OnboardingLayout
      currentStep={2}
      title="Dados Profissionais"
      backUrl="/onboarding"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage
          message="Agora vamos conhecer um pouco mais sobre sua empresa e sua função profissional. Essas informações nos ajudarão a personalizar as soluções mais adequadas para o seu contexto de negócio."
        />
        <ProfessionalDataStep
          onSubmit={saveStepData}
          isSubmitting={false}
          initialData={progress}
          isLastStep={false}
          onComplete={completeOnboarding}
        />
      </div>
    </OnboardingLayout>
  );
};

export default ProfessionalData;
