
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { BusinessContextStep } from "@/components/onboarding/steps/BusinessContextStep";
import { useNavigate } from "react-router-dom";
import { useBusinessContextStep } from "@/hooks/onboarding/useBusinessContextStep";

const BusinessContext = () => {
  const navigate = useNavigate();
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    progress
  } = useBusinessContextStep();

  const handleSuccess = async () => {
    const success = await handleSubmit();
    if (success) {
      navigate("/onboarding/ai-experience");
    }
  };

  const handlePrevious = () => {
    navigate("/onboarding/professional-data");
  };

  return (
    <OnboardingLayout 
      currentStep={3} 
      title="Contexto do Negócio" 
      onBackClick={handlePrevious}
    >
      <BusinessContextStep
        onSubmit={handleSuccess}
        isSubmitting={isSubmitting}
        initialData={formData}
        personalInfo={progress?.personal_info}
        onPrevious={handlePrevious}
      />
    </OnboardingLayout>
  );
};

export default BusinessContext;
