
import React, { useEffect } from "react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { ProfessionalDataStep } from "@/components/onboarding/steps/ProfessionalDataStep";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useLocation, useNavigate } from "react-router-dom";

const ProfessionalData = () => {
  const { saveStepData, isSubmitting, navigateToPreviousStep } = useOnboardingSteps();
  const { progress } = useProgress();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Verificar se estamos na rota antiga e redirecionar se necessário
  useEffect(() => {
    if (location.pathname === "/onboarding/professional") {
      console.log("Redirecionando de /onboarding/professional para /onboarding/professional-data");
      navigate("/onboarding/professional-data", { replace: true });
    }
  }, [location.pathname, navigate]);
  
  const handleSubmit = async (stepId: string, data: any) => {
    await saveStepData(stepId, data);
  };
  
  const handlePrevious = () => {
    navigateToPreviousStep();
  };
  
  return (
    <ProfessionalDataStep 
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      initialData={progress}
      onPrevious={handlePrevious}
      isLastStep={false}
      personalInfo={progress?.personal_info}
    />
  );
};

export default ProfessionalData;
