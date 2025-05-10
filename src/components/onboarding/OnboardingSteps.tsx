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
  
  const pathToStepComponent = {
    "/onboarding": "personal",
    "/onboarding/professional-data": "professional_data", 
    "/onboarding/business-context": "business_context",
    "/onboarding/ai-experience": "ai_exp",
    "/onboarding/club-goals": "business_goals",
    "/onboarding/customization": "experience_personalization",
    "/onboarding/complementary": "complementary_info",
    "/onboarding/review": "review"
  };

  const currentPathStepId = pathToStepComponent[location.pathname as keyof typeof pathToStepComponent] || currentStep.id;
  
  useEffect(() => {
    console.log(`Rota atual: ${location.pathname}, stepId mapeado: ${currentPathStepId}, currentStep.id: ${currentStep.id}`);
  }, [location.pathname, currentPathStepId, currentStep.id]);

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
        navigateToStep={(stepId: string) => navigateToStep(stepId)}
      />
    ),
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
    if (currentPathStepId === "professional_data" || currentStep.id === "professional_data") {
      return progress.professional_info;
    }
    if (currentPathStepId === "business_context" || currentStep.id === "business_context") {
      return progress.business_context;
    }
    const sectionKey = currentStep.section as keyof OnboardingData;
    return progress[sectionKey as keyof typeof progress];
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
    const baseProps = {
      onSubmit: saveStepData,
      isSubmitting: isSubmitting,
      isLastStep: currentStepIndex === steps.length - 1,
      onComplete: completeOnboarding,
      initialData: getInitialDataForCurrentStep(),
    };

    if (supportsPersonalInfo(currentPathStepId || currentStep.id)) {
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
