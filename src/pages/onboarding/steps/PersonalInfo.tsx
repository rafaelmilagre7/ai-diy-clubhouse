
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { PersonalInfoStep } from "@/components/onboarding/steps/PersonalInfoStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { useProgress } from "@/hooks/onboarding/useProgress";

const PersonalInfo = () => {
  const { saveStepData, progress, completeOnboarding } = useOnboardingSteps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading, refreshProgress } = useProgress();

  // Efeito para carregar dados mais recentes ao entrar na página
  useEffect(() => {
    console.log("PersonalInfo montado - carregando dados mais recentes");
    refreshProgress();
  }, [refreshProgress]);

  const handleSaveData = async (data: any) => {
    setIsSubmitting(true);
    try {
      console.log("Salvando dados pessoais:", data);
      await saveStepData(data);
      console.log("Dados pessoais salvos com sucesso");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={1}
      title="Dados Pessoais"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage
          message="Bem-vindo ao onboarding do VIVER DE IA Club! Vamos começar coletando algumas informações pessoais para personalizar sua experiência."
        />
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0ABAB5]"></div>
          </div>
        ) : (
          <PersonalInfoStep
            onSubmit={handleSaveData}
            isSubmitting={isSubmitting}
            initialData={progress?.personal_info}
            isLastStep={false}
            onComplete={completeOnboarding}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default PersonalInfo;
