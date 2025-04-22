
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface PersonalInfoLoaderProps {
  totalSteps: number;
  progressPercentage: number;
  stepTitles: string[];
  onStepClick: (stepIdx: number) => void;
}

export function PersonalInfoLoader({
  totalSteps,
  progressPercentage,
  stepTitles,
  onStepClick
}: PersonalInfoLoaderProps) {
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
      <div className="flex flex-col justify-center items-center py-20 space-y-4">
        <LoadingSpinner size={10} />
        <p className="ml-4 text-gray-400 text-lg font-medium">
          Carregando seus dados pessoais, por favor aguarde...
        </p>
        <p className="text-sm text-gray-500 text-center">
          Você poderá navegar livremente entre as etapas ao terminar o carregamento.
        </p>
      </div>
    </OnboardingLayout>
  );
}
