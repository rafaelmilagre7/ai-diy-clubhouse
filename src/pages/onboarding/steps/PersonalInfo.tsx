
import React, { useEffect } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { PersonalInfoStep } from "@/components/onboarding/steps/PersonalInfoStep";
import { useNavigate } from "react-router-dom";
import { usePersonalInfoStep } from "@/hooks/onboarding/usePersonalInfoStep";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

const PersonalInfo = () => {
  const navigate = useNavigate();
  const { isLoading: progressLoading, refreshProgress } = useProgress();
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    isSaving,
    lastSaveTime
  } = usePersonalInfoStep();

  // Forçar uma atualização dos dados ao montar o componente
  useEffect(() => {
    console.log("PersonalInfo montado - carregando dados mais recentes");
    refreshProgress();
  }, [refreshProgress]);

  const handleSuccess = async () => {
    const success = await handleSubmit();
    if (success) {
      // Não mostrar toast aqui, pois já é mostrado no hook usePersonalInfoStep
      navigate("/onboarding/professional-data");
    }
  };

  if (progressLoading) {
    return (
      <OnboardingLayout 
        currentStep={1} 
        title="Dados Pessoais" 
        backUrl="/"
      >
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size={10} />
          <p className="ml-4 text-gray-400">Carregando seus dados...</p>
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
