
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { ComplementaryInfoStep } from "@/components/onboarding/steps/ComplementaryInfoStep";
import { useNavigate } from "react-router-dom";
import { useComplementaryStep } from "@/hooks/onboarding/useComplementaryStep";

const Complementary = () => {
  const navigate = useNavigate();
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    progress
  } = useComplementaryStep();

  const handleSuccess = async () => {
    const success = await handleSubmit();
    if (success) {
      navigate("/onboarding/review");
    }
  };

  const handlePrevious = () => {
    navigate("/onboarding/customization");
  };

  return (
    <OnboardingLayout 
      currentStep={7} 
      title="Informações Complementares" 
      onBackClick={handlePrevious}
    >
      <ComplementaryInfoStep
        onSubmit={handleSuccess}
        isSubmitting={isSubmitting}
        initialData={formData}
        personalInfo={progress?.personal_info}
        onPrevious={handlePrevious}
      />
    </OnboardingLayout>
  );
};

export default Complementary;
