
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { BusinessContextStep } from "@/components/onboarding/steps/BusinessContextStep";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";

const BusinessContext = () => {
  const {
    currentStepIndex,
    saveStepData,
    isSubmitting,
    completeOnboarding,
    steps,
    progress,
    navigateToStep
  } = useOnboardingSteps();

  const { isLoading } = useProgress();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isLastStep = currentStepIndex === steps.length - 1;

  // Se o usuário não estiver autenticado, redirecionamos para login
  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  // Mostra tela de carregamento enquanto busca os dados
  if (isLoading) return (
    <OnboardingLayout currentStep={3} title="Contexto do Negócio" backUrl="/onboarding/business-goals">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
      </div>
    </OnboardingLayout>
  );

  // Extrair primeiro nome do usuário para personalização
  const firstName = user?.user_metadata?.name?.split(' ')[0] || 
                   progress?.personal_info?.name?.split(' ')[0] || 
                   user?.email?.split('@')[0] || '';

  return (
    <OnboardingLayout 
      currentStep={3} 
      title="Contexto do Negócio"
      backUrl="/onboarding/business-goals"
      onStepClick={navigateToStep}
    >
      <div className="max-w-4xl mx-auto">
        <MilagrinhoMessage 
          userName={firstName}
          message="Vamos entender melhor o contexto do seu negócio para recomendar as soluções de IA mais adequadas para você."
        />
        
        <BusinessContextStep 
          onSubmit={saveStepData}
          isSubmitting={isSubmitting}
          isLastStep={isLastStep}
          onComplete={completeOnboarding}
          initialData={progress?.business_context}
        />
      </div>
    </OnboardingLayout>
  );
};

export default BusinessContext;
