
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { TeamInfoStep } from "@/components/onboarding/steps/TeamInfoStep";

const TeamInfo = () => {
  return (
    <OnboardingLayout currentStep={6} title="Informações da Equipe">
      <div className="max-w-4xl mx-auto">
        <TeamInfoStep 
          onSubmit={() => {}}
          isSubmitting={false}
          isLastStep={false}
          onComplete={() => {}}
        />
      </div>
    </OnboardingLayout>
  );
};

export default TeamInfo;
