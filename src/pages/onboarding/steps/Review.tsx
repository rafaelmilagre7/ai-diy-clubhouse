
import React, { useEffect } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { OnboardingProgress } from "@/types/onboarding";
import { ReviewSectionCard } from "@/components/onboarding/steps/ReviewSectionCard";
import { Button } from "@/components/ui/button";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";

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
  
  // Verificar se temos dados para mostrar
  if (isLoading || !progress) {
    return (
      <OnboardingLayout
        currentStep={currentStepIndex + 1}
        totalSteps={steps.length}
        progress={((currentStepIndex + 1) / steps.length) * 100}
        title="Revisar Informações"
      >
        <div className="text-center py-8">
          <Loader2 className="animate-spin h-8 w-8 mx-auto text-white" />
          <p className="mt-2 text-white">Carregando seus dados...</p>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      currentStep={currentStepIndex + 1}
      totalSteps={steps.length}
      progress={((currentStepIndex + 1) / steps.length) * 100}
      title="Revisar Informações"
      backUrl="/onboarding/complementary"
    >
      <div className="space-y-6">
        <MilagrinhoMessage
          message="Vamos revisar as informações que você compartilhou conosco. Se algo estiver incorreto, você pode voltar às etapas anteriores e fazer os ajustes necessários."
        />
        
        <div className="bg-gray-800 rounded-lg p-6 space-y-6">
          <ReviewSectionCard
            title="Dados Pessoais"
            data={progress.personal_info}
            onEdit={() => handleNavigateToStep(0)}
          />
          
          <ReviewSectionCard
            title="Dados Profissionais"
            data={progress.professional_info}
            onEdit={() => handleNavigateToStep(1)}
          />
          
          <ReviewSectionCard
            title="Contexto do Negócio"
            data={progress.business_context || progress.business_data}
            onEdit={() => handleNavigateToStep(2)}
          />
          
          <ReviewSectionCard
            title="Experiência com IA"
            data={progress.ai_experience}
            onEdit={() => handleNavigateToStep(3)}
          />
          
          <ReviewSectionCard
            title="Objetivos com o Club"
            data={progress.business_goals}
            onEdit={() => handleNavigateToStep(4)}
          />
          
          <ReviewSectionCard
            title="Personalização da Experiência"
            data={progress.experience_personalization}
            onEdit={() => handleNavigateToStep(5)}
          />
          
          <ReviewSectionCard
            title="Informações Complementares"
            data={progress.complementary_info}
            onEdit={() => handleNavigateToStep(6)}
          />
        </div>
        
        <div className="flex justify-end pt-6">
          <Button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Finalizando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Finalizar Onboarding
              </span>
            )}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default Review;
