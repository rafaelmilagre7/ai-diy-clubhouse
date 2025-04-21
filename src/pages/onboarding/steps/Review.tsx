
import React, { useEffect } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { Button } from "@/components/ui/button";
import { ReviewStep } from "@/components/onboarding/steps/ReviewStep";

const Review: React.FC = () => {
  const navigate = useNavigate();
  const { currentStepIndex, steps, completeOnboarding } = useOnboardingSteps();
  const { progress, isLoading } = useProgress();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const handleNavigateToStep = (index: number) => {
    navigate(steps[index].path);
  };
  
  const handleComplete = async () => {
    if (!progress) return;
    
    try {
      setIsSubmitting(true);
      await completeOnboarding();
    } catch (error) {
      console.error("Erro ao finalizar onboarding:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;
  
  // Verificar se temos dados para mostrar
  if (isLoading || !progress) {
    return (
      <OnboardingLayout
        currentStep={currentStepIndex + 1}
        totalSteps={steps.length}
        title="Revisar Informações"
      >
        <div className="text-center py-8">
          <Loader2 className="animate-spin h-8 w-8 mx-auto text-gray-500" />
          <p className="mt-2 text-gray-500">Carregando seus dados...</p>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      currentStep={currentStepIndex + 1}
      totalSteps={steps.length}
      title="Revisar Informações"
      backUrl="/onboarding/complementary"
      progress={progressPercentage}
    >
      <div className="space-y-6">
        <MilagrinhoMessage
          message="Vamos revisar as informações que você compartilhou conosco. Se algo estiver incorreto, você pode voltar às etapas anteriores e fazer os ajustes necessários."
        />
        
        <div className="bg-gray-50 rounded-lg p-6">
          <ReviewStep 
            progress={progress}
            onComplete={handleComplete}
            isSubmitting={isSubmitting}
            navigateToStep={handleNavigateToStep}
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default Review;
