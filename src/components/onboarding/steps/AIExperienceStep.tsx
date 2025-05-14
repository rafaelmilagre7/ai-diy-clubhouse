
import React from "react";
import { OnboardingStepProps } from "@/types/onboarding";
import { AIExperienceFormStep } from "./AIExperienceFormStep";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AIExperienceStepProps extends Partial<OnboardingStepProps> {
  onSubmit: (stepId: string, data: any) => Promise<void>;
  isSubmitting: boolean;
  initialData?: any;
  isLastStep?: boolean;
  onComplete?: () => void;
  personalInfo?: any;
}

export const AIExperienceStep: React.FC<AIExperienceStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  isLastStep,
  onComplete,
  personalInfo
}) => {
  // Simplificar o componente para apenas passar as props para o AIExperienceFormStep
  const handleFormSubmit = (stepId: string, data: any) => {
    // Repassar para a função onSubmit original
    return onSubmit(stepId, data);
  };

  return (
    <div className="space-y-6">
      <AIExperienceFormStep
        initialData={initialData?.ai_experience || initialData}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        isLastStep={isLastStep}
        onComplete={onComplete}
      />
    </div>
  );
};
