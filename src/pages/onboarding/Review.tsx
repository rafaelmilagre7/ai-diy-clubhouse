
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useProgress } from '@/hooks/onboarding/useProgress';
import { ReviewStep } from '@/components/onboarding/steps/ReviewStep';
import { useStepPersistence } from '@/hooks/onboarding/useStepPersistence';
import { Loader2 } from 'lucide-react';

const Review: React.FC = () => {
  const navigate = useNavigate();
  const { progress, isLoading } = useProgress();
  const { completeOnboarding, isSubmitting } = useStepPersistence();

  // Função para completar o onboarding e redirecionar para a página de trilha
  const handleComplete = async () => {
    await completeOnboarding();
    // A função completeOnboarding já inclui o redirecionamento para /onboarding/completed
  };

  // Função para navegar para uma etapa específica
  const navigateToStep = (stepId: string) => {
    navigate(`/onboarding/${stepId}`);
  };

  if (isLoading) {
    return (
      <OnboardingLayout 
        currentStep={8} 
        title="Revisão de Dados"
        backUrl="/onboarding/complementary_info"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-viverblue" />
          <span className="ml-3 text-lg text-viverblue-light">Carregando dados...</span>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout 
      currentStep={8} 
      title="Revisão de Dados"
      backUrl="/onboarding/complementary_info"
    >
      <div className="max-w-4xl mx-auto">
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
