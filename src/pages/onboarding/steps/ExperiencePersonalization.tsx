
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

  // Efeito para carregar os dados mais recentes
  useEffect(() => {
    const loadData = async () => {
      try {
        await refreshProgress();
        console.log("Progresso recarregado no ExperiencePersonalization:", progress);
      } catch (error) {
        console.error("Erro ao carregar progresso:", error);
      }
    };
    
    loadData();
  }, [refreshProgress]);

  const handleSaveData = async (stepId: string, data: any) => {
    try {
      setSubmitting(true);
      
      console.log(`Enviando dados para salvar (${stepId}):`, data);
      
      // Salvamos os dados do formulário
      await saveStepData(stepId, data);
      
      // Forçamos um refresh dos dados após o salvamento
      await refreshProgress();
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    } finally {
      setSubmitting(false);
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
          message="Queremos personalizar sua experiência no VIVER DE IA Club. Compartilhe seus interesses e preferências para indicarmos conteúdos, encontros e oportunidades sob medida!"
        />
        
        {progress && (
          <ExperiencePersonalizationStep
            onSubmit={handleSaveData}
            isSubmitting={submitting}
            initialData={progress}
            isLastStep={false}
            onComplete={completeOnboarding}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default ExperiencePersonalization;
