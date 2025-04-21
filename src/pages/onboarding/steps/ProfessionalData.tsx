
import React, { useState, useEffect } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ProfessionalDataStep } from "@/components/onboarding/steps/ProfessionalDataStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";

const ProfessionalData = () => {
  const { saveStepData, progress, completeOnboarding } = useOnboardingSteps();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshProgress, isLoading } = useProgress();

  // Efeito para carregar dados mais recentes ao entrar na página
  useEffect(() => {
    console.log("ProfessionalData montado - carregando dados mais recentes");
    refreshProgress();
  }, [refreshProgress]);

  const handleSaveData = async (stepId: string, data: any) => {
    try {
      setIsSubmitting(true);
      console.log("Salvando dados profissionais:", data);
      
      // Salvar sem navegação automática - isso permite que o usuário
      // continue na página após salvar
      await saveStepData(stepId, data, false);
      
      console.log("Dados profissionais salvos com sucesso");
    } catch (error) {
      console.error("Erro ao salvar dados profissionais:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={2}
      title="Dados Profissionais"
      backUrl="/onboarding"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage
          message="Agora vamos conhecer um pouco mais sobre sua empresa e sua função profissional. Essas informações nos ajudarão a personalizar as soluções mais adequadas para o seu contexto de negócio."
        />
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0ABAB5]"></div>
          </div>
        ) : (
          <ProfessionalDataStep
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

export default ProfessionalData;
