
import React from "react";
import { OnboardingCompletedNew } from "@/components/onboarding/OnboardingCompletedNew";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

const OnboardingCompletedNewPage: React.FC = () => {
  return (
    <OnboardingLayout
      title="Onboarding Concluído"
      currentStep={4}
      totalSteps={4}
      hideProgress={true}
    >
      <OnboardingCompletedNew />
    </OnboardingLayout>
  );
};

export default OnboardingCompletedNewPage;
