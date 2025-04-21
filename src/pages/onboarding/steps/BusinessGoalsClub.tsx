
import React, { useState, useEffect } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { BusinessGoalsStep } from "@/components/onboarding/steps/BusinessGoalsStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { useProgress } from "@/hooks/onboarding/useProgress";

const BusinessGoalsClub = () => {
  const { saveStepData, progress, completeOnboarding, refreshProgress } = useOnboardingSteps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading } = useProgress();

  // Efeito para carregar dados mais recentes ao entrar na página
  useEffect(() => {
    console.log("BusinessGoalsClub montado - carregando dados mais recentes");
    refreshProgress();
  }, [refreshProgress]);

  const handleSaveData = async (stepId: string, data: any) => {
    setIsSubmitting(true);
    try {
      console.log("Salvando dados de objetivos:", data);
      // Salvar sem navegação automática para permitir voltar manualmente
      await saveStepData(stepId, data, false);
      console.log("Dados de objetivos salvos com sucesso");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={5}
      title="Expectativas e Objetivos com o Club"
      backUrl="/onboarding/ai-experience"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage
          message="Agora, gostaria de entender quais são suas expectativas e objetivos com o VIVER DE IA Club. Isso nos ajudará a personalizar sua experiência e garantir que você obtenha o máximo valor possível."
        />
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0ABAB5]"></div>
          </div>
        ) : (
          <BusinessGoalsStep
            onSubmit={handleSaveData}
            isSubmitting={isSubmitting}
            initialData={progress?.business_goals}
            isLastStep={false}
            onComplete={completeOnboarding}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default BusinessGoalsClub;
