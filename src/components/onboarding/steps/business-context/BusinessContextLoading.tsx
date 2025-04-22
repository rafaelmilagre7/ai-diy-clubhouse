
import React from "react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { Loader2 } from "lucide-react";

export const BusinessContextLoading = () => {
  return (
    <OnboardingLayout 
      currentStep={3} 
      totalSteps={7}
      title="Contexto do Negócio"
    >
      <div className="bg-white p-6 rounded-lg shadow space-y-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-[#0ABAB5] animate-spin" />
          <p className="mt-4 text-gray-600">Carregando dados do contexto de negócio...</p>
        </div>
      </div>
    </OnboardingLayout>
  );
};
