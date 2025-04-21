
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ComplementaryInfoStep } from "@/components/onboarding/steps/ComplementaryInfoStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";

const ComplementaryInfo = () => {
  const { saveStepData, progress } = useOnboardingSteps();

  return (
    <OnboardingLayout
      currentStep={6}
      title="Informações Complementares"
      backUrl="/onboarding/experience-personalization"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage
          message="Estamos quase finalizando! Estas últimas informações vão nos ajudar a personalizar ainda mais sua experiência no VIVER DE IA Club e entender como podemos evoluir sempre."
        />
        <ComplementaryInfoStep
          onSubmit={saveStepData}
          isSubmitting={false}
          initialData={progress?.complementary_info}
          isLastStep={false}
        />
      </div>
    </OnboardingLayout>
  );
};

export default ComplementaryInfo;
