
import React, { useState, useEffect } from "react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { AIExperienceStep } from "@/components/onboarding/steps/AIExperienceStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { toast } from "sonner";
import { useLogging } from "@/hooks/useLogging";

const AIExperience = () => {
  const { saveStepData, progress, completeOnboarding } = useOnboardingSteps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading, refreshProgress } = useProgress();
  const { log } = useLogging();

  useEffect(() => {
    console.log("AIExperience montado - carregando dados mais recentes");
    refreshProgress();
  }, [refreshProgress]);

  useEffect(() => {
    if (progress) {
      console.log("Dados de AI Experience obtidos:", progress.ai_experience);
    }
  }, [progress]);

  const handleSaveData = async (stepId: string, data: any) => {
    setIsSubmitting(true);
    try {
      console.log("Salvando dados de experiência com IA:", data);
      log("onboarding_ai_experience_submit", { data });
      
      if (typeof data === 'string') {
        console.warn("Convertendo dados de string para objeto antes de salvar");
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error("Erro ao converter string para objeto:", e);
          data = { ai_experience: { default: data } };
        }
      }
      
      if (!data.ai_experience && typeof data === 'object') {
        console.log("Encapsulando dados em ai_experience");
        data = { ai_experience: data };
      }
      
      await saveStepData(stepId, data, true);
      
      console.log("Dados de experiência com IA salvos com sucesso");
      
      await refreshProgress();
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      log("onboarding_ai_experience_error", { error });
      toast.error("Erro ao salvar as informações. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { steps } = useOnboardingSteps();
  const currentStepIndex = steps.findIndex(step => step.id === "ai_exp");
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={steps.length}
      title="Experiência com IA"
      backUrl="/onboarding/business-context"
      progress={progressPercentage}
      steps={steps}
      activeStep="ai_exp"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage
          message="Vamos conhecer um pouco sobre sua experiência com Inteligência Artificial. Isso nos ajudará a personalizar as recomendações e conteúdos mais adequados para o seu nível de conhecimento."
        />
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0ABAB5]"></div>
          </div>
        ) : (
          <AIExperienceStep
            onSubmit={handleSaveData}
            isSubmitting={isSubmitting}
            initialData={progress}
            isLastStep={false}
            onComplete={completeOnboarding}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default AIExperience;
