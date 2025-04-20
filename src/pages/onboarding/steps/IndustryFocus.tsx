
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { IndustryFocusStep } from "@/components/onboarding/steps/IndustryFocusStep";

const IndustryFocus = () => {
  return (
    <OnboardingLayout currentStep={4} title="Foco da Indústria">
      <div className="max-w-4xl mx-auto">
        <IndustryFocusStep 
          onSubmit={() => {}}
          isSubmitting={false}
          isLastStep={false}
          onComplete={() => {}}
        />
      </div>
    </OnboardingLayout>
  );
};

export default IndustryFocus;
