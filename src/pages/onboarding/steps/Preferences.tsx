
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { PreferencesStep } from "@/components/onboarding/steps/PreferencesStep";

const Preferences = () => {
  return (
    <OnboardingLayout currentStep={7} title="Preferências">
      <div className="max-w-4xl mx-auto">
        <PreferencesStep 
          onSubmit={() => {}}
          isSubmitting={false}
          isLastStep={true}
          onComplete={() => {}}
        />
      </div>
    </OnboardingLayout>
  );
};

export default Preferences;
