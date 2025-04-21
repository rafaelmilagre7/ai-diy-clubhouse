
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

interface TrailGenerationHeaderProps {
  backUrl?: string;
  children?: React.ReactNode;
}

export const TrailGenerationHeader: React.FC<TrailGenerationHeaderProps> = ({ backUrl = "/onboarding", children }) => (
  <OnboardingLayout currentStep={9} title="Sua Trilha Personalizada" backUrl={backUrl}>
    {children}
  </OnboardingLayout>
);
