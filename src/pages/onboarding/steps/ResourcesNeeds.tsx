
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { ResourcesNeedsStep } from "@/components/onboarding/steps/ResourcesNeedsStep";

const ResourcesNeeds = () => {
  return (
    <OnboardingLayout currentStep={5} title="Recursos Necessários">
      <div className="max-w-4xl mx-auto">
        <ResourcesNeedsStep 
          onSubmit={() => {}}
          isSubmitting={false}
          isLastStep={false}
          onComplete={() => {}}
        />
      </div>
    </OnboardingLayout>
  );
};

export default ResourcesNeeds;
