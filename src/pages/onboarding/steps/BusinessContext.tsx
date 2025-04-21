
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { BusinessContextStep } from "@/components/onboarding/steps/BusinessContextStep";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const BusinessContext = () => {
  const { progress, isLoading } = useProgress();
  const { saveStepData, currentStepIndex, steps } = useOnboardingSteps();
  const navigate = useNavigate();

  // Calcular progresso para exibição
  const progressPercentage = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  const handleSave = async (stepId: string, data: any): Promise<void> => {
    try {
      console.log("Salvando dados de contexto de negócio:", data);
      await saveStepData(data, true);
      
      // Verificar se a navegação automática funcionou
      setTimeout(() => {
        const currentPath = window.location.pathname;
        if (currentPath === "/onboarding/business-context") {
          console.log("Navegação não ocorreu automaticamente, forçando redirecionamento");
          toast.info("Avançando para a próxima etapa...");
          navigate("/onboarding/ai-experience");
        }
      }, 1000);
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <OnboardingLayout
        currentStep={3}
        totalSteps={steps.length}
        progress={progressPercentage}
        title="Contexto do Negócio"
      >
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
          <p className="text-gray-500">Carregando seus dados...</p>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={steps.length}
      progress={progressPercentage}
      title="Contexto do Negócio"
      backUrl="/onboarding/professional-data"
    >
      <BusinessContextStep
        onSubmit={handleSave}
        isSubmitting={false}
        initialData={progress?.business_context || progress?.business_data}
      />
    </OnboardingLayout>
  );
};

export default BusinessContext;
