import React from "react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface PersonalInfoForceButtonProps {
  totalSteps: number;
  progressPercentage: number;
  stepTitles: string[];
  onStepClick: (stepIdx: number) => void;
  onForceContinue: () => void;
  onRetry: () => void;
}

export function PersonalInfoForceButton({
  totalSteps,
  progressPercentage,
  stepTitles,
  onStepClick,
  onForceContinue,
  onRetry
}: PersonalInfoForceButtonProps) {
  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={totalSteps}
      title="Dados Pessoais"
      backUrl="/"
      progress={progressPercentage}
      stepTitles={stepTitles}
      onStepClick={onStepClick}
    >
      <div className="space-y-6">
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <AlertDescription className="ml-2 text-yellow-700">
            Estamos tendo dificuldades para carregar seus dados. Você pode continuar mesmo assim ou tentar novamente.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={() => {
              toast.info("Continuando com dados padrão");
              onForceContinue();
            }}
            className="px-4 py-2 bg-[#0ABAB5] text-white rounded hover:bg-[#0ABAB5]/90"
          >
            Continuar mesmo assim
          </button>
          <button
            onClick={onRetry}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
