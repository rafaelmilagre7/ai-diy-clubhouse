
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ExperiencePersonalizationStep } from "@/components/onboarding/steps/ExperiencePersonalizationStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";

const ExperiencePersonalization = () => {
  const { saveStepData, progress } = useOnboardingSteps();

  return (
    <OnboardingLayout
      currentStep={6}
      title="Personalização da Experiência"
      backUrl="/onboarding/preferences"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage
          message="Queremos personalizar sua experiência no VIVER DE IA Club. Compartilhe seus interesses e preferências para indicarmos conteúdos, encontros e oportunidades sob medida!"
        />
        <ExperiencePersonalizationStep
          onSubmit={saveStepData}
          isSubmitting={false}
          initialData={progress?.experience_personalization}
          isLastStep={false}
        />
      </div>
    </OnboardingLayout>
  );
};

export default ExperiencePersonalization;
