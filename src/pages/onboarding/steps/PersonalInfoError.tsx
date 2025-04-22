
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface PersonalInfoErrorProps {
  totalSteps: number;
  progressPercentage: number;
  stepTitles: string[];
  onStepClick: (stepIdx: number) => void;
  loadError: string | null;
  lastError: any;
  onRetry: () => void;
}

export function PersonalInfoError({
  totalSteps,
  progressPercentage,
  stepTitles,
  onStepClick,
  loadError,
  lastError,
  onRetry
}: PersonalInfoErrorProps) {
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
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription className="ml-2">
            {loadError || (lastError ? "Erro ao carregar dados de progresso." : "")}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-[#0ABAB5] text-white rounded hover:bg-[#0ABAB5]/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
