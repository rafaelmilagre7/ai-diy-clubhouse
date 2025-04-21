
import React, { useState, useEffect } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ExperiencePersonalizationStep } from "@/components/onboarding/steps/ExperiencePersonalizationStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { useNavigate } from "react-router-dom";

const ExperiencePersonalization = () => {
  const { saveStepData, progress, completeOnboarding } = useOnboardingSteps();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSaveData = async (stepId: string, data: any) => {
    try {
      setSubmitting(true);
      
      // Salva os dados do formulário
      await saveStepData(stepId, data);
      
      // Navega para a próxima etapa após salvar com sucesso
      setTimeout(() => {
        navigate("/onboarding/complementary");
      }, 300);
      
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      // Não usamos toast aqui para evitar notificações indesejadas
    } finally {
      setSubmitting(false);
    }
  };

  // Efeito para verificar se já temos dados salvos
  useEffect(() => {
    if (progress?.completed_steps?.includes("experience_personalization")) {
      // Se essa etapa já foi concluída, podemos redirecionar para a próxima
      // Mas não faremos isso automaticamente, permitindo que o usuário revise
    }
  }, [progress]);

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
