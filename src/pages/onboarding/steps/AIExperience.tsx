
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
      // Navegar direto para a geração da trilha (onboarding novo)
      navigate("/onboarding/trail-generation");
    }
  };

  const handlePrevious = () => {
    navigate("/onboarding/personal-info");
  };

  return (
    <OnboardingLayout 
      currentStep={2} 
      totalSteps={3}
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
