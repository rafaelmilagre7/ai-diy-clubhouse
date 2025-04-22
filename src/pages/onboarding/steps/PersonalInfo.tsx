
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
    isSaving,
    lastSaveTime
  } = usePersonalInfoStep();

  const handleSuccess = async () => {
    const success = await handleSubmit();
    if (success) {
      navigate("/onboarding/professional-data");
    }
  };

  return (
    <OnboardingLayout currentStep={1} title="Dados Pessoais" backUrl="/">
      <PersonalInfoStep
        onSubmit={handleSuccess}
        isSubmitting={isSubmitting}
        formData={formData}
        errors={errors}
        onChange={handleChange}
        isSaving={isSaving}
        lastSaveTime={lastSaveTime}
      />
    </OnboardingLayout>
  );
};

export default PersonalInfo;
