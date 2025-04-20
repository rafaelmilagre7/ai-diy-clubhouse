
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { BusinessGoalsStep } from "@/components/onboarding/steps/BusinessGoalsStep";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { useNavigate } from "react-router-dom";

const BusinessGoals = () => {
  const { 
    saveStepData, 
    isSubmitting, 
    currentStep, 
    currentStepIndex,
    steps,
    progress
  } = useOnboardingSteps();
  
  const navigate = useNavigate();
  
  const handlePrevious = () => {
    navigate("/onboarding");
  };

  return (
    <OnboardingLayout currentStep={2} title="Objetivos do Negócio">
      <div className="max-w-4xl mx-auto">
        <BusinessGoalsStep 
          onSubmit={saveStepData}
          isSubmitting={isSubmitting}
          isLastStep={currentStepIndex === steps.length - 1}
          onComplete={() => {}}
          initialData={progress}
          personalInfo={progress?.personal_info}
          onPrevious={handlePrevious}
        />
      </div>
    </OnboardingLayout>
  );
};

export default BusinessGoals;
