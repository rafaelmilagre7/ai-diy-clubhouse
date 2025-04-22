
import React from "react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { ProfessionalDataStep } from "@/components/onboarding/steps/ProfessionalDataStep";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { useProgress } from "@/hooks/onboarding/useProgress";

const ProfessionalData = () => {
  const { saveStepData, isSubmitting, navigateToPreviousStep } = useOnboardingSteps();
  const { progress } = useProgress();
  
  const handleSubmit = async (stepId: string, data: any) => {
    await saveStepData(stepId, data);
  };
  
  const handlePrevious = () => {
    navigateToPreviousStep();
  };
  
  return (
    <ProfessionalDataStep 
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      initialData={progress}
      onPrevious={handlePrevious}
      isLastStep={false}
      personalInfo={progress?.personal_info}
    />
  );
};

export default ProfessionalData;
