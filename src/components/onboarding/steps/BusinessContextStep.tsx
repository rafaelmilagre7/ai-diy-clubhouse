
import React from "react";
import { BusinessContextFormStep } from "./business-context/BusinessContextFormStep";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { OnboardingStepProps } from "@/types/onboarding";
import { toast } from "sonner";

export const BusinessContextStep: React.FC<OnboardingStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  personalInfo,
  onPrevious
}) => {
  const { progress } = useProgress();
  const { saveStepData } = useOnboardingSteps();

  const handleSave = async (data: any) => {
    try {
      await saveStepData("business_context", data, true);
      toast.success("Contexto do negócio salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar contexto do negócio:", error);
      toast.error("Erro ao salvar dados. Tente novamente.");
      throw error;
    }
  };

  return (
    <BusinessContextFormStep
      progress={progress}
      onSave={handleSave}
    />
  );
};
