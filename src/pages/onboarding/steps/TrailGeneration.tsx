
import { TrailGuidedExperience } from "@/components/onboarding/TrailGuidedExperience";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

const TrailGeneration = () => {
  return (
    <OnboardingLayout 
      currentStep={9} 
      title="Sua Trilha Personalizada"
      backUrl="/onboarding/review"
    >
      <div className="max-w-5xl mx-auto p-4">
        <TrailGuidedExperience />
      </div>
    </OnboardingLayout>
  );
};

export default TrailGeneration;
