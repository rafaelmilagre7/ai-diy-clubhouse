import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { usePersonalInfoStep } from "@/hooks/onboarding/usePersonalInfoStep";
import OnboardingCompleted from "./OnboardingCompleted";
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

export const OnboardingSteps = () => {
  const {
    currentStepIndex,
    currentStep,
    steps,
    isSubmitting: globalIsSubmitting,
    saveStepData,
    completeOnboarding,
    progress,
    navigateToStep
  } = useOnboardingSteps();

  const {
    formData: personalFormData,
    errors: personalErrors,
    isSubmitting: personalIsSubmitting,
    handleChange: personalHandleChange,
    handleSubmit: personalHandleSubmit,
    isSaving: personalIsSaving,
    lastSaveTime: personalLastSaveTime
  } = usePersonalInfoStep();
  
  const location = useLocation();
  const [showCompletedScreen, setShowCompletedScreen] = useState(false);
  
  useEffect(() => {
    if (progress?.is_completed) {
      setShowCompletedScreen(true);
    }
  }, [progress]);
  
  const pathToStepComponent = {
    "/onboarding": "personal",
    "/onboarding/professional-data": "professional_data", 
    "/onboarding/business-context": "business_context",
    "/onboarding/ai-experience": "ai_exp",
    "/onboarding/club-goals": "business_goals",
    "/onboarding/customization": "experience_personalization",
    "/onboarding/complementary": "complementary_info",
    "/onboarding/review": "review",
    "/onboarding/trail-generation": "trail_generation",
    "/onboarding/steps": "personal"
  };

  const currentPathStepId = pathToStepComponent[location.pathname as keyof typeof pathToStepComponent] || currentStep.id;
  
  useEffect(() => {
    console.log(`Rota atual: ${location.pathname}, stepId: ${currentPathStepId}, currentStep.id: ${currentStep.id}`);
  }, [location.pathname, currentPathStepId, currentStep.id]);

  const adaptedPersonalHandleSubmit = async (): Promise<void> => {
    await personalHandleSubmit();
  };
  
  if (showCompletedScreen) {
    return <OnboardingCompleted />;
  }

  const stepComponents: Record<string, any> = {
    personal: () => (
      <PersonalInfoStep
        onSubmit={adaptedPersonalHandleSubmit}
        isSubmitting={personalIsSubmitting}
        formData={personalFormData}
        errors={personalErrors || {}}
        onChange={personalHandleChange}
        isSaving={personalIsSaving}
        lastSaveTime={personalLastSaveTime}
      />
    ),
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
        isSubmitting={globalIsSubmitting}
        navigateToStep={(index: number) => navigateToStep(index)}
      />
    ),
  };

  const getCurrentStepComponent = () => {
    if (currentPathStepId === "personal" || currentStep.id === "personal") {
      return stepComponents.personal();
    }
    
    const StepComponent = stepComponents[currentPathStepId as keyof typeof stepComponents] || 
                       stepComponents[currentStep.id as keyof typeof stepComponents];
    
    if (!StepComponent) {
      console.warn(`Componente não encontrado para etapa: ${currentPathStepId || currentStep.id}`);
      return null;
    }

    if (typeof StepComponent === 'function' && StepComponent !== stepComponents.personal) {
      if (StepComponent === stepComponents.review) {
        return <StepComponent />;
      }
      
      return (
        <StepComponent
          onSubmit={saveStepData}
          isSubmitting={globalIsSubmitting}
          isLastStep={currentStepIndex === steps.length - 1}
          onComplete={completeOnboarding}
          initialData={getInitialDataForCurrentStep()}
        />
      );
    }

    return (
      <StepComponent
        onSubmit={saveStepData}
        isSubmitting={globalIsSubmitting}
        isLastStep={currentStepIndex === steps.length - 1}
        onComplete={completeOnboarding}
        initialData={getInitialDataForCurrentStep()}
      />
    );
  };

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
        {getCurrentStepComponent()}
      </div>
    </div>
  );
};
