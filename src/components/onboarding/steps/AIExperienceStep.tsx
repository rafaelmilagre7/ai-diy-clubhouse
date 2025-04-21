
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
  console.log("AIExperienceStep - initialData:", initialData);
  
  return (
    <AIExperienceFormStep
      initialData={initialData}
      onSubmit={(stepId, data) => {
        console.log("AIExperienceStep - submitting data:", data);
        onSubmit(stepId, data);
      }}
      isSubmitting={isSubmitting}
      isLastStep={isLastStep}
      onComplete={onComplete}
    />
  );
};
