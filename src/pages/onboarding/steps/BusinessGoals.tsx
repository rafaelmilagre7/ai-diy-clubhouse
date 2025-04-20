
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { BusinessGoalsStep } from "@/components/onboarding/steps/BusinessGoalsStep";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { useNavigate } from "react-router-dom";

const BusinessGoals = () => {
  const { 
    saveStepData, 
    isSubmitting, 
    currentStepIndex,
    steps,
    progress
  } = useOnboardingSteps();
  
  const navigate = useNavigate();
  
  const handlePrevious = () => {
    navigate("/onboarding");
  };

  return (
    <OnboardingLayout 
      currentStep={2} 
      title="Dados Profissionais"
      backUrl="/onboarding"
    >
      <div className="max-w-4xl mx-auto">
        <BusinessGoalsStep 
          onSubmit={saveStepData}
          isSubmitting={isSubmitting}
          isLastStep={currentStepIndex === steps.length - 1}
          onComplete={() => {}}
          initialData={progress}
          personalInfo={progress?.personal_info}
        />
      </div>
    </OnboardingLayout>
  );
};

export default BusinessGoals;
