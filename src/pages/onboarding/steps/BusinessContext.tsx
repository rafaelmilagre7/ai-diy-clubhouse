
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { BusinessContextFormStep } from "@/components/onboarding/steps/business-context/BusinessContextFormStep";
import { BusinessContextLoading } from "@/components/onboarding/steps/business-context/BusinessContextLoading";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { toast } from "sonner";

const BusinessContext = () => {
  const { progress, isLoading, refreshProgress } = useProgress();
  const { saveStepData } = useOnboardingSteps();
  const [localLoading, setLocalLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);

  // Efeito para carregar dados mais recentes ao entrar na página
  useEffect(() => {
    console.log("BusinessContext montado - carregando dados mais recentes");
    const loadData = async () => {
      try {
        setLoadError(null);
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
  }, [refreshProgress]);

  if (isLoading || localLoading) {
    return <BusinessContextLoading step={3} />;
  }

  return (
    <OnboardingLayout
      currentStep={3}
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
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Recarregar página
          </button>
        </div>
      ) : (
        <BusinessContextFormStep progress={progress} />
      )}
    </OnboardingLayout>
  );
};

export default BusinessContext;
