
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { PersonalInfoStep } from "@/components/onboarding/steps/PersonalInfoStep";
import { useNavigate } from "react-router-dom";
import { usePersonalInfoStep } from "@/hooks/onboarding/usePersonalInfoStep";

const PersonalInfo = () => {
  const navigate = useNavigate();
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    progress
  } = usePersonalInfoStep();

  const handleSuccess = async () => {
    const success = await handleSubmit();
    if (success) {
      navigate("/onboarding/ai-experience");
    }
  };

  return (
    <OnboardingLayout 
      currentStep={1} 
      totalSteps={3}
      title="Informações Pessoais"
    >
      <PersonalInfoStep
        onSubmit={handleSuccess}
        isSubmitting={isSubmitting}
        formData={formData}
        errors={errors}
        onChange={handleChange}
        initialData={formData}
        onPrevious={undefined}
      />
    </OnboardingLayout>
  );
};

export default PersonalInfo;
