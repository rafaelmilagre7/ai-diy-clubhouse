
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { BusinessGoalsStep } from "./steps/BusinessGoalsStep";
import { BusinessContextStep } from "./steps/BusinessContextStep";
import { AIExperienceStep } from "./steps/AIExperienceStep";
import { ExperiencePersonalizationStep } from "./steps/ExperiencePersonalizationStep";
import { ComplementaryInfoStep } from "./steps/ComplementaryInfoStep";
import { ReviewStep } from "./steps/ReviewStep";
import { Progress } from "@/components/ui/progress";
import { OnboardingData } from "@/types/onboarding";
import { ProfessionalDataStep } from "./steps/ProfessionalDataStep";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

export const OnboardingSteps = () => {
  const {
    currentStepIndex,
    currentStep,
    steps,
    isSubmitting,
    saveStepData,
    completeOnboarding,
    progress,
    navigateToStep,
    isLoading
  } = useOnboardingSteps();
  
  const location = useLocation();
  const [componentLoading, setComponentLoading] = useState(true);
  
  // Mapeamento correto de caminhos para IDs de etapa
  const pathToStepComponent = {
    "/onboarding": "personal",
    "/onboarding/professional-data": "professional_data", 
    "/onboarding/business-context": "business_context",
    "/onboarding/ai-experience": "ai_exp",
    "/onboarding/club-goals": "business_goals",
    "/onboarding/customization": "experience_personalization",
    "/onboarding/complementary": "complementary_info",
    "/onboarding/review": "review",
    "/onboarding/trail-generation": "trail_generation"
  };

  const currentPathStepId = pathToStepComponent[location.pathname as keyof typeof pathToStepComponent] || currentStep?.id || "personal";
  
  useEffect(() => {
    console.log(`Rota atual: ${location.pathname}, stepId mapeado: ${currentPathStepId}, currentStep.id: ${currentStep?.id || "não definido"}`);
    
    // Após o carregamento inicial, desativar o estado de loading
    const timer = setTimeout(() => {
      setComponentLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [location.pathname, currentPathStepId, currentStep]);

  // Mapeamento de componentes para cada etapa do onboarding
  const stepComponents = {
    personal: PersonalInfoStep,
    professional_data: ProfessionalDataStep,
    business_context: BusinessContextStep,
    ai_exp: AIExperienceStep,
    business_goals: BusinessGoalsStep,
    experience_personalization: ExperiencePersonalizationStep,
    complementary_info: ComplementaryInfoStep,
    review: () => (
      <ReviewStep 
        progress={progress} 
        onComplete={completeOnboarding} 
        isSubmitting={isSubmitting}
        navigateToStep={(index: number) => navigateToStep(index)}
      />
    ),
  };

  const getCurrentStepId = () => {
    // Se estamos na rota raiz de onboarding, usar sempre "personal"
    if (location.pathname === "/onboarding") {
      return "personal";
    }
    
    // Caso contrário, usar o ID do mapeamento ou fallback para currentStep
    return currentPathStepId || currentStep?.id || "personal";
  };

  const CurrentStepComponent = stepComponents[getCurrentStepId() as keyof typeof stepComponents];
  
  // Se não encontrou o componente, mostrar mensagem e opção de retorno
  if (!CurrentStepComponent) {
    console.warn(`Componente não encontrado para etapa: ${getCurrentStepId()}`);
    return (
      <div className="text-center p-6 bg-amber-50 border border-amber-200 rounded-lg">
        <h2 className="text-xl font-semibold text-amber-700 mb-4">Etapa não encontrada</h2>
        <p className="text-amber-700 mb-4">
          Não foi possível encontrar esta etapa do onboarding. Isso pode ter ocorrido devido a uma URL incorreta 
          ou uma mudança na estrutura do processo.
        </p>
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={() => navigateToStep(0)} 
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Voltar ao Início
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="px-4 py-2 border border-amber-400 text-amber-700 rounded-md hover:bg-amber-100"
          >
            Recarregar Página
          </Button>
        </div>
      </div>
    );
  }

  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  const getInitialDataForCurrentStep = () => {
    if (!progress) return undefined;
    
    const stepId = getCurrentStepId();
    
    if (stepId === "professional_data") {
      return progress.professional_info;
    }
    if (stepId === "business_context") {
      return progress.business_context;
    }
    
    // Buscar dados específicos com base na seção atual
    if (stepId && stepId in progress) {
      return progress[stepId as keyof typeof progress];
    }
    
    return undefined;
  };

  const supportsPersonalInfo = (stepId: string) => {
    return (
      stepId === "professional_data" || 
      stepId === "business_context" || 
      stepId === "ai_exp" || 
      stepId === "business_goals" || 
      stepId === "experience_personalization" || 
      stepId === "complementary_info" || 
      stepId === "review"
    );
  };

  const getPropsForCurrentStep = () => {
    const stepId = getCurrentStepId();
    const baseProps = {
      onSubmit: saveStepData,
      isSubmitting: isSubmitting,
      isLastStep: currentStepIndex === steps.length - 1,
      onComplete: completeOnboarding,
      initialData: getInitialDataForCurrentStep(),
    };

    if (supportsPersonalInfo(stepId)) {
      return {
        ...baseProps,
        personalInfo: progress?.personal_info,
      };
    }

    return baseProps;
  };

  if (isLoading || componentLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 animate-fade-in">
        <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-4" />
        <p className="text-gray-500">Carregando etapa...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-white">
            {currentStep?.title || "Onboarding"}
          </h2>
          <p className="text-gray-400">
            Passo {currentStepIndex + 1} de {steps.length}
          </p>
        </div>
      </div>
      
      <div className="w-full">
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <CurrentStepComponent
          {...getPropsForCurrentStep()}
        />
      </div>
    </div>
  );
};
