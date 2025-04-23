
import React, { useEffect } from "react";
import { ProfessionalDataStep } from "@/components/onboarding/steps/ProfessionalDataStep";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ProfessionalData = () => {
  const { saveStepData, isSubmitting, navigateToPreviousStep } = useOnboardingSteps();
  const { progress } = useProgress();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Log ampliado para diagnóstico
  useEffect(() => {
    console.log("ProfessionalData component montado", {
      path: location.pathname,
      progress: progress,
      isCurrentlySubmitting: isSubmitting
    });
    
    // Não redirecionar automaticamente, permitir que a página professional seja exibida
  }, [location.pathname, progress]);
  
  const handleSubmit = async (stepId: string, data: any) => {
    console.log("Dados profissionais enviados:", data);
    await saveStepData(stepId, data);
  };
  
  const handlePrevious = () => {
    console.log("Navegando para etapa anterior");
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
