
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ExperiencePersonalizationStep } from "@/components/onboarding/steps/ExperiencePersonalizationStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { useProgress } from "@/hooks/onboarding/useProgress";

const ExperiencePersonalization = () => {
  const { saveStepData, progress, completeOnboarding, refreshProgress } = useOnboardingSteps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading } = useProgress();

  // Efeito para carregar dados mais recentes ao entrar na página
  useEffect(() => {
    console.log("ExperiencePersonalization montado - carregando dados mais recentes");
    refreshProgress();
  }, [refreshProgress]);

  const handleSaveData = async (stepId: string, data: any) => {
    setIsSubmitting(true);
    try {
      console.log("Salvando dados de personalização:", data);
      // Agora permitimos a navegação automática após salvar os dados
      await saveStepData(stepId, data, true);
      console.log("Dados de personalização salvos com sucesso");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={6}
      title="Personalização da Experiência"
      backUrl="/onboarding/club-goals"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage
          message="Vamos personalizar sua experiência no VIVER DE IA Club. Suas preferências nos ajudarão a entregar conteúdo e oportunidades que sejam mais relevantes para você."
        />
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0ABAB5]"></div>
          </div>
        ) : (
          <ExperiencePersonalizationStep
            onSubmit={handleSaveData}
            isSubmitting={isSubmitting}
            initialData={progress?.experience_personalization}
            isLastStep={false}
            onComplete={completeOnboarding}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default ExperiencePersonalization;
