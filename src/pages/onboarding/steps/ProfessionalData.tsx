
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ProfessionalDataStep } from "@/components/onboarding/steps/ProfessionalDataStep";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ProfessionalData = () => {
  const {
    currentStepIndex,
    steps,
    isSubmitting,
    saveStepData,
    progress
  } = useOnboardingSteps();

  const navigate = useNavigate();

  // Função para calcular o progresso
  const progressPercentage = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  // Função para salvar dados e garantir navegação
  const handleSaveData = async (data: any) => {
    try {
      console.log("ProfessionalData - Salvando dados:", data);
      
      // Usar saveStepData do hook
      await saveStepData(data);
      
      // Verificar se a navegação automática não funcionou e forçar redirecionamento
      setTimeout(() => {
        console.log("Verificando navegação para a próxima etapa...");
        const currentPath = window.location.pathname;
        
        if (currentPath === "/onboarding/professional-data") {
          console.log("Navegação não ocorreu automaticamente, forçando redirecionamento para a próxima etapa");
          navigate("/onboarding/business-context");
        }
      }, 500);
      
    } catch (error) {
      console.error("Erro ao salvar dados profissionais:", error);
      toast.error("Ocorreu um erro ao salvar seus dados. Por favor, tente novamente.");
    }
  };

  return (
    <OnboardingLayout
      currentStep={currentStepIndex + 1}
      totalSteps={steps.length}
      progress={progressPercentage}
      title="Dados Profissionais"
    >
      <ProfessionalDataStep
        onSubmit={handleSaveData}
        isSubmitting={isSubmitting}
        isLastStep={false}
        onComplete={() => {}}
        initialData={progress}
        personalInfo={progress?.personal_info}
      />
    </OnboardingLayout>
  );
};

export default ProfessionalData;
