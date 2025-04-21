
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { ExpectativasObjetivosStep } from "@/components/onboarding/steps/ExpectativasObjetivosStep";
import { OnboardingData } from "@/types/onboarding";

const BusinessGoalsClub = () => {
  const { saveStepData } = useOnboardingSteps();
  const navigate = useNavigate();
  const { progress, isLoading } = useProgress();

  const handleSubmit = async (stepId: string, data: Partial<OnboardingData>) => {
    try {
      await saveStepData(stepId, data);
      toast.success("Expectativas e objetivos salvos com sucesso!");
      navigate("/onboarding/industry-focus");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar as informações. Tente novamente.");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <OnboardingLayout currentStep={5} title="Carregando...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout 
      currentStep={5} 
      title="Expectativas e Objetivos com o Club"
      backUrl="/onboarding/ai-experience"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage 
          message="Agora, vamos entender melhor suas expectativas em relação ao VIVER DE IA Club. Estas informações nos ajudarão a personalizar sua experiência e garantir que você obtenha o máximo valor da sua participação."
        />
        
        <ExpectativasObjetivosStep
          onSubmit={handleSubmit}
          isSubmitting={false}
          isLastStep={false}
          initialData={progress?.business_goals}
        />
      </div>
    </OnboardingLayout>
  );
};

export default BusinessGoalsClub;
