
import React, { useState, useEffect } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ExperiencePersonalizationStep } from "@/components/onboarding/steps/ExperiencePersonalizationStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";

const ExperiencePersonalization = () => {
  const { saveStepData, progress, completeOnboarding } = useOnboardingSteps();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { refreshProgress } = useProgress();

  const handleSaveData = async (stepId: string, data: any) => {
    try {
      setSubmitting(true);
      
      // Salva os dados do formulário
      await saveStepData(stepId, data);
      
      // Força um refresh dos dados após o salvamento
      await refreshProgress();
      
      // Navega para a próxima etapa após salvar com sucesso
      navigate("/onboarding/complementary");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      // Mantemos apenas mensagens contextuais no formulário
    } finally {
      setSubmitting(false);
    }
  };

  // Efeito para verificar se já temos dados salvos
  useEffect(() => {
    if (progress?.completed_steps?.includes("experience_personalization")) {
      console.log("Etapa já foi concluída anteriormente", progress.experience_personalization);
    }
    
    // Forçar um refresh dos dados ao entrar na página
    refreshProgress();
  }, [progress, refreshProgress]);

  return (
    <OnboardingLayout
      currentStep={6}
      title="Personalização da Experiência"
      backUrl="/onboarding/club-goals"
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
