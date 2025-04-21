
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ReviewStep } from "@/components/onboarding/steps/ReviewStep";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { toast } from "sonner";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { useAuth } from "@/contexts/auth";

const Review = () => {
  const { completeOnboarding, navigateToStep } = useOnboardingSteps();
  const { progress, isLoading, refreshProgress } = useProgress();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuth();

  // Efeito para carregar dados mais recentes ao entrar na página
  useEffect(() => {
    console.log("Review montado - carregando dados mais recentes");
    refreshProgress();
  }, [refreshProgress]);

  const handleCompleteOnboarding = async () => {
    try {
      setIsSubmitting(true);
      await completeOnboarding();
    } catch (error) {
      console.error("Erro ao completar onboarding:", error);
      toast.error("Erro ao finalizar o onboarding. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extrair primeiro nome do perfil
  const firstName = profile?.name?.split(" ")[0] || "Usuário";

  return (
    <OnboardingLayout
      currentStep={8}
      title="Revisar e Finalizar"
      backUrl="/onboarding/complementary"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <MilagrinhoMessage
          userName={firstName}
          message="Vamos revisar todas as informações que você forneceu. Verifique se está tudo correto antes de finalizar o onboarding e gerar sua trilha personalizada."
          type="info"
        />

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0ABAB5]"></div>
          </div>
        ) : (
          <ReviewStep
            progress={progress}
            onComplete={handleCompleteOnboarding}
            isSubmitting={isSubmitting}
            navigateToStep={(index: number) => navigateToStep(index)}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default Review;
