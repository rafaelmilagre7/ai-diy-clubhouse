
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

interface BusinessContextLoadingProps {
  step: number;
}

export const BusinessContextLoading: React.FC<BusinessContextLoadingProps> = ({ step }) => {
  return (
    <OnboardingLayout
      currentStep={step}
      totalSteps={8}
      progress={Math.round((step / 8) * 100)}
      title="Contexto do Negócio"
    >
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
        <p className="text-gray-500">Carregando seus dados...</p>
      </div>
    </OnboardingLayout>
  );
};
