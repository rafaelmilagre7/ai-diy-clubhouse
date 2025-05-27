
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { BusinessGoalsStep } from "@/components/onboarding/steps/BusinessGoalsStep";
import { useNavigate } from "react-router-dom";
import { useBusinessGoalsStep } from "@/hooks/onboarding/useBusinessGoalsStep";

const ClubGoals = () => {
  const navigate = useNavigate();
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    progress
  } = useBusinessGoalsStep();

  const handleSuccess = async () => {
    const success = await handleSubmit();
    if (success) {
      navigate("/onboarding/customization");
    }
  };

  const handlePrevious = () => {
    navigate("/onboarding/ai-experience");
  };

  return (
    <OnboardingLayout 
      currentStep={5} 
      title="Objetivos do Negócio" 
      onBackClick={handlePrevious}
    >
      <BusinessGoalsStep
        onSubmit={handleSuccess}
        isSubmitting={isSubmitting}
        initialData={formData}
        personalInfo={progress?.personal_info}
        onPrevious={handlePrevious}
      />
    </OnboardingLayout>
  );
};

export default ClubGoals;
