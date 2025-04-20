
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { BusinessGoalsStep } from "@/components/onboarding/steps/BusinessGoalsStep";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";

const BusinessGoals = () => {
  const { 
    saveStepData, 
    isSubmitting, 
    currentStepIndex,
    steps,
    navigateToStep
  } = useOnboardingSteps();
  
  const { progress, isLoading } = useProgress();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Se o usuário não estiver autenticado, redirecionamos para login
  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  // Mostra tela de carregamento enquanto busca os dados
  if (isLoading) return (
    <OnboardingLayout currentStep={2} title="Carregando..." backUrl="/onboarding" onStepClick={() => {}}>
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
      currentStep={2} 
      title="Dados Profissionais"
      backUrl="/onboarding"
      onStepClick={(step) => {
        if (step === 1) {
          navigateToStep(0);
        }
      }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <MilagrinhoMessage 
          userName={firstName}
          message="Para personalizar sua experiência, conte um pouco sobre a empresa onde você trabalha. Estas informações são essenciais para recomendar as melhores soluções para seu negócio."
        />
        
        <BusinessGoalsStep 
          onSubmit={saveStepData}
          isSubmitting={isSubmitting}
          isLastStep={currentStepIndex === steps.length - 1}
          onComplete={() => {}}
          initialData={progress}
          personalInfo={progress?.personal_info}
        />
      </div>
    </OnboardingLayout>
  );
};

export default BusinessGoals;
