
import React from "react";
import { OnboardingStepProps } from "@/types/onboarding";
import { AIExperienceFormStep } from "./AIExperienceFormStep";

export const AIExperienceStep: React.FC<OnboardingStepProps> = ({
  onSubmit,
  isSubmitting,
  isLastStep,
  onComplete,
  initialData,
}) => {
  return (
    <AIExperienceFormStep
      initialData={initialData}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      isLastStep={isLastStep}
      onComplete={onComplete}
    />
  );
};
