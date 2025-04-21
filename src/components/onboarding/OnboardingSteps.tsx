
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
  
  // Mapear caminhos para IDs de componentes de etapa
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

  // Identificar o componente correto com base na URL atual
  const currentPathStepId = pathToStepComponent[location.pathname as keyof typeof pathToStepComponent] || currentStep.id;
  
  useEffect(() => {
    // Log para diagnóstico
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
        navigateToStep={(index: number) => navigateToStep(index)}
      />
    ),
  };

  // Usar o ID da etapa baseado na URL atual, se disponível, caso contrário usar o currentStep
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
      return {
        ...progress,
        company_name: progress.company_name || progress.professional_info?.company_name || "",
        company_size: progress.company_size || progress.professional_info?.company_size || "",
        company_sector: progress.company_sector || progress.professional_info?.company_sector || "",
        company_website: progress.company_website || progress.professional_info?.company_website || "",
        current_position: progress.current_position || progress.professional_info?.current_position || "",
        annual_revenue: progress.annual_revenue || progress.professional_info?.annual_revenue || "",
      };
    }
    if (currentPathStepId === "business_context" || currentStep.id === "business_context") {
      // Mapear business_data para business_context
      return progress.business_data;
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
        <CurrentStepComponent
          onSubmit={saveStepData}
          isSubmitting={isSubmitting}
          isLastStep={currentStepIndex === steps.length - 1}
          onComplete={completeOnboarding}
          initialData={getInitialDataForCurrentStep()}
          personalInfo={progress?.personal_info}
        />
      </div>
    </div>
  );
};
