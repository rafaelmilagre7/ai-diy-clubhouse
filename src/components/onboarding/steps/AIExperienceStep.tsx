
import React from "react";
import { AIExperienceFormStep } from "./AIExperienceFormStep";
import { NavigationButtons } from "../NavigationButtons";

export interface AIExperienceStepProps {
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  initialData?: any;
  personalInfo?: any;
  onPrevious?: () => void;
}

export const AIExperienceStep: React.FC<AIExperienceStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  personalInfo,
  onPrevious
}) => {
  const handleFormSubmit = async (stepId: string, data: any) => {
    await onSubmit();
  };

  return (
    <div className="space-y-6">
      <AIExperienceFormStep
        initialData={initialData?.ai_experience || initialData}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />
      
      <NavigationButtons
        onPrevious={onPrevious}
        isSubmitting={isSubmitting}
        showPrevious={true}
        submitText="Gerar Trilha"
        loadingText="Processando..."
      />
    </div>
  );
};
