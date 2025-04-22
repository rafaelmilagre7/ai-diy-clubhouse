
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
    lastSaveTime,
    loadInitialData
  } = usePersonalInfoStep();

  useEffect(() => {
    console.log("[DEBUG] PersonalInfo montado - iniciando carregamento de dados");
    const fetchData = async () => {
      console.log("[DEBUG] Atualizando progresso para pegar dados mais recentes");
      await refreshProgress();
      console.log("[DEBUG] Carregando dados iniciais do formulário após refresh");
      loadInitialData();
    };
    
    fetchData();
    
    return () => {
      console.log("[DEBUG] PersonalInfo desmontado");
    };
  }, [refreshProgress, loadInitialData]);

  useEffect(() => {
    console.log("[DEBUG] Dados do formulário atualizados:", formData);
  }, [formData]);

  const handleSuccess = async () => {
    console.log("[DEBUG] Tentativa de envio do formulário");
    const success = await handleSubmit();
    if (success) {
      console.log("[DEBUG] Formulário enviado com sucesso, navegando para próxima etapa");
      navigate("/onboarding/professional-data");
    } else {
      console.log("[DEBUG] Falha ao enviar formulário");
    }
  };

  if (progressLoading) {
    console.log("[DEBUG] Exibindo spinner de carregamento");
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
