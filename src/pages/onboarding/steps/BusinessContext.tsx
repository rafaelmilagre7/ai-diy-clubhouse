
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { BusinessContextFormStep } from "@/components/onboarding/steps/business-context/BusinessContextFormStep";
import { BusinessContextLoading } from "@/components/onboarding/steps/business-context/BusinessContextLoading";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";

const BusinessContext = () => {
  const { progress, isLoading, refreshProgress } = useProgress();
  const { saveStepData } = useOnboardingSteps();
  const [localLoading, setLocalLoading] = useState(true);

  // Efeito para carregar dados mais recentes ao entrar na página
  useEffect(() => {
    console.log("BusinessContext montado - carregando dados mais recentes");
    const loadData = async () => {
      try {
        await refreshProgress();
        console.log("Dados atualizados para BusinessContext");
      } catch (error) {
        console.error("Erro ao carregar dados do BusinessContext:", error);
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
      <BusinessContextFormStep progress={progress} />
    </OnboardingLayout>
  );
};

export default BusinessContext;
