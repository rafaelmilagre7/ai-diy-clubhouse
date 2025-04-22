
import React from "react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { Loader2 } from "lucide-react";
import { useStepDefinitions } from "@/hooks/onboarding/useStepDefinitions";

export const BusinessContextLoading = () => {
  const { steps } = useStepDefinitions();
  const currentStepIndex = steps.findIndex(step => step.id === "business_context");
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <OnboardingLayout 
      currentStep={currentStepIndex + 1} 
      totalSteps={steps.length}
      title="Contexto do Negócio"
      progress={progressPercentage}
      steps={steps}
      activeStep="business_context"
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
