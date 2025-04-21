
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

interface BusinessContextLoadingProps {
  step: number;
}

export const BusinessContextLoading: React.FC<BusinessContextLoadingProps> = ({ step }) => (
  <OnboardingLayout currentStep={step} title="Carregando...">
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
    </div>
  </OnboardingLayout>
);
