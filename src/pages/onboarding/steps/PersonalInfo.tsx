
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { PersonalInfoStep } from "@/components/onboarding/steps/PersonalInfoStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const PersonalInfo = () => {
  const { saveStepData, progress, completeOnboarding, navigateToStep } = useOnboardingSteps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading, refreshProgress } = useProgress();
  const navigate = useNavigate();

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
      toast.success("Dados salvos com sucesso!");
      
      // Navegar para a próxima etapa após salvar
      setTimeout(() => {
        navigate("/onboarding/professional-data");
      }, 500);
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={1}
      title="Dados Pessoais"
      description="Vamos conhecer um pouco mais sobre você para personalizar sua experiência no VIVER DE IA Club."
      backUrl="/onboarding"
      onStepClick={(step) => navigateToStep(step - 1)}
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
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default PersonalInfo;
