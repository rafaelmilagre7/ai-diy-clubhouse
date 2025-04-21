
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { AIExperienceStep } from "@/components/onboarding/steps/AIExperienceStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AIExperience = () => {
  const { saveStepData, progress, completeOnboarding, refreshProgress } = useOnboardingSteps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading } = useProgress();
  const navigate = useNavigate();

  // Efeito para carregar dados mais recentes ao entrar na página
  useEffect(() => {
    console.log("AIExperience montado - carregando dados mais recentes");
    refreshProgress();
  }, [refreshProgress]);

  const handleSaveData = async (stepId: string, data: any) => {
    setIsSubmitting(true);
    try {
      console.log("Salvando dados de experiência com IA:", data);
      
      // Salvar com navegação automática para a próxima etapa
      await saveStepData(stepId, data, true);
      
      console.log("Dados de experiência com IA salvos com sucesso, navegando para a próxima etapa");
      toast.success("Informações salvas com sucesso!");
      
      // Garantir navegação manual
      setTimeout(() => {
        navigate("/onboarding/club-goals");
      }, 500);
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar as informações. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={4}
      title="Experiência com IA"
      backUrl="/onboarding/business-context"
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
            initialData={progress?.ai_experience}
            isLastStep={false}
            onComplete={completeOnboarding}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default AIExperience;
