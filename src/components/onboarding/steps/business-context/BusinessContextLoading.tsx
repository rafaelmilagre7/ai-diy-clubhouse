
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

interface BusinessContextLoadingProps {
  step: number;
  totalSteps?: number;
}

export const BusinessContextLoading: React.FC<BusinessContextLoadingProps> = ({ 
  step,
  totalSteps = 8
}) => {
  return (
    <OnboardingLayout
      currentStep={step}
      totalSteps={totalSteps}
      progress={Math.round((step / totalSteps) * 100)}
      title="Contexto do Negócio"
      backUrl="/onboarding/professional-data"
    >
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
        <p className="text-gray-500">Carregando seus dados...</p>
        <p className="text-sm text-gray-400">Etapa 3 de {totalSteps}</p>
      </div>
    </OnboardingLayout>
  );
};
