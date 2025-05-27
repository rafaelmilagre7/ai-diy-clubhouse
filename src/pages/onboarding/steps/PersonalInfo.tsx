
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { PersonalInfoStep } from "@/components/onboarding/steps/PersonalInfoStep";
import { useNavigate } from "react-router-dom";
import { usePersonalInfoStep } from "@/hooks/onboarding/usePersonalInfoStep";
import { useOnboardingGuard } from "@/hooks/onboarding/useOnboardingGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

const PersonalInfo = () => {
  const navigate = useNavigate();
  const { isOnboardingComplete, isLoading: guardLoading } = useOnboardingGuard();
  
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    isSaving,
    lastSaveTime,
    loadInitialData
  } = usePersonalInfoStep();

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleSuccess = async () => {
    const success = await handleSubmit();
    if (success) {
      navigate("/onboarding/professional-data");
    }
  };

  // Se ainda está verificando o guard, mostrar loading
  if (guardLoading) {
    return (
      <OnboardingLayout 
        currentStep={1} 
        title="Dados Pessoais" 
        backUrl="/"
      >
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
          <p className="ml-4 text-gray-400">Verificando seu progresso...</p>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout 
      currentStep={1} 
      title="Dados Pessoais" 
      backUrl="/"
    >
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
