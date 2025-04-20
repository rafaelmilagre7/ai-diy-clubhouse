
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { BusinessGoalsStep } from "@/components/onboarding/steps/BusinessGoalsStep";

const BusinessGoals = () => {
  return (
    <OnboardingLayout currentStep={2} title="Objetivos do Negócio">
      <div className="max-w-4xl mx-auto">
        <BusinessGoalsStep 
          onSubmit={() => {}}
          isSubmitting={false}
          isLastStep={false}
          onComplete={() => {}}
        />
      </div>
    </OnboardingLayout>
  );
};

export default BusinessGoals;
