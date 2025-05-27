
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { AIExperienceStep } from "@/components/onboarding/steps/AIExperienceStep";
import { useNavigate } from "react-router-dom";
import { useAIExperienceStep } from "@/hooks/onboarding/useAIExperienceStep";

const AIExperience = () => {
  const navigate = useNavigate();
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    progress
  } = useAIExperienceStep();

  const handleSuccess = async () => {
    const success = await handleSubmit();
    if (success) {
      navigate("/onboarding/club-goals");
    }
  };

  const handlePrevious = () => {
    navigate("/onboarding/business-context");
  };

  return (
    <OnboardingLayout 
      currentStep={4} 
      title="Experiência com IA" 
      onBackClick={handlePrevious}
    >
      <AIExperienceStep
        onSubmit={handleSuccess}
        isSubmitting={isSubmitting}
        initialData={formData}
        personalInfo={progress?.personal_info}
        onPrevious={handlePrevious}
      />
    </OnboardingLayout>
  );
};

export default AIExperience;
