
import React, { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ReviewStep } from "@/components/onboarding/steps/ReviewStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";

const Review = () => {
  const { completeOnboarding, progress, navigateToStep } = useOnboardingSteps();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={8}
      title="Revisar e Finalizar"
      backUrl="/onboarding/complementary-info"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage
          message="Você está quase pronto! Revise os dados fornecidos e, se necessário, faça edições clicando nos botões 'Editar'. Quando estiver satisfeito, clique em 'Concluir Onboarding' para acessar sua conta."
        />
        
        <ReviewStep
          progress={progress}
          onComplete={handleComplete}
          isSubmitting={isSubmitting}
          navigateToStep={navigateToStep}
        />
      </div>
    </OnboardingLayout>
  );
};

export default Review;
