
import React from 'react';
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

export const BusinessContextLoading = () => {
  return (
    <OnboardingLayout
      currentStep={3}
      title="Contexto do Negócio"
    >
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#0ABAB5]"></div>
        <p className="mt-4 text-gray-300">Carregando informações do seu negócio...</p>
      </div>
    </OnboardingLayout>
  );
};
