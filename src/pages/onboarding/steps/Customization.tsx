
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { ExperiencePersonalizationStep } from "@/components/onboarding/steps/ExperiencePersonalizationStep";
import { useNavigate } from "react-router-dom";
import { useCustomizationStep } from "@/hooks/onboarding/useCustomizationStep";

const Customization = () => {
  const navigate = useNavigate();
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    progress
  } = useCustomizationStep();

  const handleSuccess = async () => {
    const success = await handleSubmit();
    if (success) {
      navigate("/onboarding/complementary");
    }
  };

  const handlePrevious = () => {
    navigate("/onboarding/club-goals");
  };

  return (
    <OnboardingLayout 
      currentStep={6} 
      title="Personalização da Experiência" 
      onBackClick={handlePrevious}
    >
      <ExperiencePersonalizationStep
        onSubmit={handleSuccess}
        isSubmitting={isSubmitting}
        initialData={formData}
        personalInfo={progress?.personal_info}
        onPrevious={handlePrevious}
      />
    </OnboardingLayout>
  );
};

export default Customization;
