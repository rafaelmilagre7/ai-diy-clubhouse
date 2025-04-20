
import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { BusinessGoalsStep } from "@/components/onboarding/steps/BusinessGoalsStep";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
    <OnboardingLayout 
      currentStep={2} 
      title="Dados Profissionais"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center mb-1">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-600"
            onClick={handlePrevious}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="mt-8">
          <BusinessGoalsStep 
            onSubmit={saveStepData}
            isSubmitting={isSubmitting}
            isLastStep={currentStepIndex === steps.length - 1}
            onComplete={() => {}}
            initialData={progress}
            personalInfo={progress?.personal_info}
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default BusinessGoals;
