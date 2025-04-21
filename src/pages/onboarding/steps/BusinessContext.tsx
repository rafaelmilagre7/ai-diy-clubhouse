
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { BusinessContextLoading } from "@/components/onboarding/steps/business-context/BusinessContextLoading";
import { BusinessContextForm } from "@/components/onboarding/steps/business-context/BusinessContextForm";

const BusinessContext = () => {
  const { progress, isLoading } = useProgress();

  if (isLoading) {
    return <BusinessContextLoading step={3} />;
  }

  return (
    <OnboardingLayout 
      currentStep={3} 
      title="Contexto do Negócio"
      backUrl="/onboarding/business-goals"
    >
      <BusinessContextForm progress={progress} />
    </OnboardingLayout>
  );
};

export default BusinessContext;
