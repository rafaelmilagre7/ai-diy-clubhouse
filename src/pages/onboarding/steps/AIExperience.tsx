
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { AIExperienceFormStep } from "@/components/onboarding/steps/AIExperienceFormStep";

const AIExperience = () => {
  const { progress, saveStepData, isSubmitting, currentStepIndex, steps } = useOnboardingSteps();

  return (
    <OnboardingLayout currentStep={4} title="Experiência com IA">
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage
          message="Conte para mim um pouco sobre sua experiência com IA. Assim conseguiremos personalizar melhor as recomendações de ferramentas e trilhas para sua realidade."
        />
        <AIExperienceFormStep
          initialData={progress?.ai_experience}
          onSubmit={saveStepData}
          isSubmitting={isSubmitting}
          isLastStep={currentStepIndex === steps.length - 1}
        />
      </div>
    </OnboardingLayout>
  );
};

export default AIExperience;
