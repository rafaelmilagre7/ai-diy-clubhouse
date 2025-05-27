
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { BusinessContextStep } from "./steps/BusinessContextStep";
import { AIExperienceStep } from "./steps/AIExperienceStep";
import { ExperiencePersonalizationStep } from "./steps/ExperiencePersonalizationStep";
import { ComplementaryInfoStep } from "./steps/ComplementaryInfoStep";
import { ReviewStep } from "./steps/ReviewStep";
import { Progress } from "@/components/ui/progress";
import { OnboardingData } from "@/types/onboarding";
import { ProfessionalDataStep } from "./steps/ProfessionalDataStep";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const OnboardingSteps = () => {
  const {
    currentStepIndex,
    currentStep,
    steps,
    isSubmitting,
    saveStepData,
    completeOnboarding,
    progress,
    navigateToStep
  } = useOnboardingSteps();
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Mapeamento simplificado para o onboarding NOVO (3 etapas)
  const pathToStepComponent = {
    "/onboarding": "personal_info",
    "/onboarding/personal-info": "personal_info",
    "/onboarding/ai-experience": "ai_experience",
    "/onboarding/trail-generation": "trail_generation"
  };

  // Mapeamento reverso para navegação
  const stepToPath = {
    "personal_info": "/onboarding/personal-info",
    "ai_experience": "/onboarding/ai-experience",
    "trail_generation": "/onboarding/trail-generation"
  };

  const currentPathStepId = pathToStepComponent[location.pathname as keyof typeof pathToStepComponent] || currentStep.id;
  
  useEffect(() => {
    console.log(`Rota atual: ${location.pathname}, stepId mapeado: ${currentPathStepId}, currentStep.id: ${currentStep.id}`);
  }, [location.pathname, currentPathStepId, currentStep.id]);

  // Função para navegar para a etapa anterior
  const navigateToPreviousStep = (currentStepId: string) => {
    const stepIds = Object.keys(stepToPath);
    const currentIndex = stepIds.indexOf(currentStepId);
    
    if (currentIndex <= 0) {
      navigate("/onboarding/personal-info");
      return;
    }
    
    const previousStepId = stepIds[currentIndex - 1];
    const previousPath = stepToPath[previousStepId as keyof typeof stepToPath];
    
    console.log(`[OnboardingSteps] Navegando da etapa ${currentStepId} para etapa anterior ${previousStepId} (${previousPath})`);
    navigate(previousPath);
  };

  // Componentes simplificados para o onboarding NOVO
  const stepComponents = {
    personal_info: PersonalInfoStep,
    ai_experience: AIExperienceStep,
    trail_generation: () => null, // Esta etapa é tratada em TrailGeneration.tsx
  };

  const CurrentStepComponent = stepComponents[currentPathStepId as keyof typeof stepComponents] || 
                              stepComponents[currentStep.id as keyof typeof stepComponents];
  
  if (!CurrentStepComponent) {
    console.warn(`Componente não encontrado para etapa: ${currentPathStepId || currentStep.id}`);
    return null;
  }

  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  const getInitialDataForCurrentStep = () => {
    if (!progress) return undefined;
    if (currentPathStepId === "ai_experience" || currentStep.id === "ai_experience") {
      return progress.ai_experience;
    }
    const sectionKey = currentStep.section as keyof OnboardingData;
    return progress[sectionKey as keyof typeof progress];
  };

  const getPropsForCurrentStep = () => {
    const baseProps = {
      onSubmit: saveStepData,
      isSubmitting: isSubmitting,
      isLastStep: currentStepIndex === steps.length - 1,
      onComplete: completeOnboarding,
      initialData: getInitialDataForCurrentStep(),
      onPrevious: () => navigateToPreviousStep(currentPathStepId || currentStep.id),
    };

    // Para ai_experience, adicionar personalInfo
    if (currentPathStepId === "ai_experience" || currentStep.id === "ai_experience") {
      return {
        ...baseProps,
        personalInfo: progress?.personal_info,
      };
    }

    return baseProps;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-white">
            {currentStep.title}
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
