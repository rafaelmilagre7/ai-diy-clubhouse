import React from "react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { BusinessContextStep } from "@/components/onboarding/steps/BusinessContextStep";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const BusinessContext = () => {
  const { progress, isLoading, refreshProgress } = useProgress();
  const { saveStepData, currentStepIndex, steps } = useOnboardingSteps();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      console.log("Carregando dados atualizados na página de contexto de negócio");
      await refreshProgress();
    };
    
    loadData();
  }, [refreshProgress]);

  const progressPercentage = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  const getInitialData = () => {
    if (!progress) return {};
    
    const fromContext = progress.business_context || {};
    const fromData = progress.business_data || {};
    
    return {
      ...fromData,
      ...fromContext
    };
  };

  const handleSave = async (stepId: string, data: any): Promise<void> => {
    try {
      console.log("Salvando dados de contexto de negócio:", data);
      
      setTimeout(() => {
        const formattedData = {
          business_context: data
        };
        
        saveStepData("business_context", formattedData, true);
      }, 100);
      
      setTimeout(() => {
        const currentPath = window.location.pathname;
        if (currentPath === "/onboarding/business-context") {
          console.log("Navegação não ocorreu automaticamente, forçando redirecionamento");
          navigate("/onboarding/ai-experience");
        }
      }, 1500);
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
        title="Contexto do Negócio"
      >
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
          <p className="text-gray-500">Carregando seus dados...</p>
        </div>
      </OnboardingLayout>
    );
  }

  const initialData = getInitialData();
  console.log("Dados iniciais para o formulário de contexto:", initialData);

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={steps.length}
      title="Contexto do Negócio"
      backUrl="/onboarding/professional-data"
      progress={progressPercentage}
    >
      <BusinessContextStep
        onSubmit={handleSave}
        isSubmitting={false}
        initialData={initialData}
      />
    </OnboardingLayout>
  );
};

export default BusinessContext;
