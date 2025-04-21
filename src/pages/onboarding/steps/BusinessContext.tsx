
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { BusinessContextFormStep } from "@/components/onboarding/steps/business-context/BusinessContextFormStep";
import { BusinessContextLoading } from "@/components/onboarding/steps/business-context/BusinessContextLoading";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const BusinessContext = () => {
  const { progress, isLoading, refreshProgress } = useProgress();
  const { saveStepData, currentStepIndex, steps } = useOnboardingSteps();
  const [localLoading, setLocalLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const navigate = useNavigate();

  // Efeito para carregar dados mais recentes ao entrar na página
  useEffect(() => {
    console.log("BusinessContext montado - carregando dados mais recentes");
    const loadData = async () => {
      try {
        setLoadError(null);
        setLocalLoading(true);
        await refreshProgress();
        console.log("Dados atualizados para BusinessContext:", progress);
      } catch (error) {
        console.error("Erro ao carregar dados do BusinessContext:", error);
        setLoadError(error instanceof Error ? error : new Error('Erro desconhecido ao carregar dados'));
        toast.error("Ocorreu um erro ao carregar seus dados. Algumas informações podem não estar atualizadas.");
      } finally {
        setLocalLoading(false);
      }
    };
    
    loadData();
  }, [refreshProgress, refreshCount]);

  // Função para tentar recarregar dados
  const handleRetryLoading = () => {
    setLocalLoading(true);
    setRefreshCount(prev => prev + 1);
  };

  // Handler para salvar dados e garantir navegação
  const handleSave = async (data: any): Promise<void> => {
    try {
      // Formatando os dados para o formato esperado pelo saveStepData
      const businessContextData = {
        business_context: data
      };
      
      console.log("Salvando dados de contexto de negócio:", businessContextData);
      await saveStepData(businessContextData, true);
      
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
      throw error;
    }
  };

  // Calcular progresso para exibição
  const progressPercentage = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  if (isLoading || localLoading) {
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
      {loadError ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-medium text-red-800">Erro ao carregar dados</h3>
          <p className="text-sm text-red-600 mt-2">
            Ocorreu um erro ao carregar seus dados. Por favor, tente novamente ou continue preenchendo as informações.
          </p>
          <button 
            onClick={handleRetryLoading}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <BusinessContextFormStep 
          progress={progress} 
          onSave={handleSave}
        />
      )}
    </OnboardingLayout>
  );
};

export default BusinessContext;
