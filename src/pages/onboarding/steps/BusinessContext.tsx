
import React, { useEffect } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { BusinessContextFormStep } from "@/components/onboarding/steps/business-context/BusinessContextFormStep";
import { BusinessContextLoading } from "@/components/onboarding/steps/business-context/BusinessContextLoading";

const BusinessContext = () => {
  const { progress, isLoading, refreshProgress } = useProgress();

  // Efeito para carregar dados mais recentes ao entrar na página
  useEffect(() => {
    console.log("BusinessContext montado - carregando dados mais recentes");
    refreshProgress();
  }, [refreshProgress]);

  if (isLoading) {
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
