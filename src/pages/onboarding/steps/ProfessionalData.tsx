
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { ProfessionalDataStep } from "@/components/onboarding/steps/ProfessionalDataStep";
import { useNavigate } from "react-router-dom";
import { useProfessionalDataStep } from "@/hooks/onboarding/useProfessionalDataStep";

const ProfessionalData = () => {
  const navigate = useNavigate();
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    progress
  } = useProfessionalDataStep();

  const handleSuccess = async () => {
    const success = await handleSubmit();
    if (success) {
      navigate("/onboarding/business-context");
    }
  };

  const handlePrevious = () => {
    navigate("/onboarding/personal-info");
  };

  return (
    <OnboardingLayout 
      currentStep={2} 
      title="Dados Profissionais" 
      onBackClick={handlePrevious}
    >
      <ProfessionalDataStep
        onSubmit={handleSuccess}
        isSubmitting={isSubmitting}
        initialData={formData}
        personalInfo={progress?.personal_info}
        onPrevious={handlePrevious}
      />
    </OnboardingLayout>
  );
};

export default ProfessionalData;
