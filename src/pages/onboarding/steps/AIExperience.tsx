
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { AIExperienceStep } from "@/components/onboarding/steps/AIExperienceStep";

const AIExperience = () => {
  return (
    <OnboardingLayout currentStep={3} title="Experiência com IA">
      <div className="max-w-4xl mx-auto">
        <AIExperienceStep 
          onSubmit={() => {}}
          isSubmitting={false}
          isLastStep={false}
          onComplete={() => {}}
        />
      </div>
    </OnboardingLayout>
  );
};

export default AIExperience;
