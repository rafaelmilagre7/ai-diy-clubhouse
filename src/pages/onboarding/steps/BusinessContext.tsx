
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { BusinessContextStep } from "@/components/onboarding/steps/BusinessContextStep";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";

const BusinessContext = () => {
  const {
    currentStepIndex,
    saveStepData,
    isSubmitting,
    completeOnboarding,
    steps,
    progress
  } = useOnboardingSteps();

  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <OnboardingLayout currentStep={3} title="Contexto do Negócio">
      <div className="max-w-4xl mx-auto">
        <BusinessContextStep 
          onSubmit={saveStepData}
          isSubmitting={isSubmitting}
          isLastStep={isLastStep}
          onComplete={completeOnboarding}
          initialData={progress}
        />
      </div>
    </OnboardingLayout>
  );
};

export default BusinessContext;
