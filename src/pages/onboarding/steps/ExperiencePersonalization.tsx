
import React, { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ExperiencePersonalizationStep } from "@/components/onboarding/steps/ExperiencePersonalizationStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { toast } from "sonner";

const ExperiencePersonalization = () => {
  const { saveStepData, progress, completeOnboarding } = useOnboardingSteps();
  const [submitting, setSubmitting] = useState(false);

  const handleSaveData = async (stepId: string, data: any) => {
    try {
      setSubmitting(true);
      console.log("Enviando dados:", data);
      await saveStepData(stepId, data);
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Ocorreu um erro ao salvar os dados. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={6}
      title="Personalização da Experiência"
      backUrl="/onboarding/preferences"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage
          message="Queremos personalizar sua experiência no VIVER DE IA Club. Compartilhe seus interesses e preferências para indicarmos conteúdos, encontros e oportunidades sob medida!"
        />
        <ExperiencePersonalizationStep
          onSubmit={handleSaveData}
          isSubmitting={submitting}
          initialData={progress?.experience_personalization}
          isLastStep={false}
          onComplete={completeOnboarding}
        />
      </div>
    </OnboardingLayout>
  );
};

export default ExperiencePersonalization;
