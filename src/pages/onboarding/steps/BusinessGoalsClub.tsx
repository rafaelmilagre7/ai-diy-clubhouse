
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { BusinessGoalsStep } from "@/components/onboarding/steps/BusinessGoalsStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";

const BusinessGoalsClub = () => {
  const { saveStepData, progress, completeOnboarding } = useOnboardingSteps();

  return (
    <OnboardingLayout
      currentStep={5}
      title="Expectativas e Objetivos com o Club"
      backUrl="/onboarding/ai-experience"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage
          message="Agora, gostaria de entender quais são suas expectativas e objetivos com o VIVER DE IA Club. Isso nos ajudará a personalizar sua experiência e garantir que você obtenha o máximo valor possível."
        />
        <BusinessGoalsStep
          onSubmit={saveStepData}
          isSubmitting={false}
          initialData={progress?.business_goals}
          isLastStep={false}
          onComplete={completeOnboarding}
        />
      </div>
    </OnboardingLayout>
  );
};

export default BusinessGoalsClub;
