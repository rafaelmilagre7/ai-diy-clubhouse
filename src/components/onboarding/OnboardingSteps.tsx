
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { BusinessGoalsStep } from "./steps/BusinessGoalsStep";
import { AIExperienceStep } from "./steps/AIExperienceStep";
import { IndustryFocusStep } from "./steps/IndustryFocusStep";
import { ResourcesNeedsStep } from "./steps/ResourcesNeedsStep";
import { TeamInfoStep } from "./steps/TeamInfoStep";
import { PreferencesStep } from "./steps/PreferencesStep";
import { Progress } from "@/components/ui/progress";
import { OnboardingData } from "@/types/onboarding";

export const OnboardingSteps = () => {
  const {
    currentStep,
    currentStepIndex,
    steps,
    isSubmitting,
    saveStepData,
    completeOnboarding,
    progress
  } = useOnboardingSteps();

  const stepComponents = {
    personal: PersonalInfoStep,
    goals: BusinessGoalsStep,
    ai_exp: AIExperienceStep,
    industry: IndustryFocusStep,
    resources: ResourcesNeedsStep,
    team: TeamInfoStep,
    preferences: PreferencesStep,
  };

  const CurrentStepComponent = stepComponents[currentStep.id as keyof typeof stepComponents];
  if (!CurrentStepComponent) return null;

  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  // Determinar os dados iniciais para o componente atual
  const getInitialDataForCurrentStep = () => {
    if (!progress) return undefined;
    // Para o passo "goals" prioriza os campos profissionais
    if (currentStep.id === "goals") {
      return {
        ...progress,
        company_name: progress.company_name,
        company_size: progress.company_size,
        company_sector: progress.company_sector,
        company_website: progress.company_website,
        current_position: progress.current_position,
        annual_revenue: progress.annual_revenue,
        personal_info: progress.personal_info,
      };
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
          personalInfo={progress?.personal_info} // Só para a etapa goals será usado
        />
      </div>
    </div>
  );
};
