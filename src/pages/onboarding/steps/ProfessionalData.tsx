
import React, { useEffect } from "react";
import { ProfessionalDataStep } from "@/components/onboarding/steps/ProfessionalDataStep";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLogging } from "@/hooks/useLogging";

const ProfessionalData = () => {
  const logger = useLogging("ProfessionalData");
  const { saveStepData, isSubmitting, navigateToPreviousStep } = useOnboardingSteps();
  const { progress } = useProgress();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Log ampliado para diagnóstico
  useEffect(() => {
    logger.logInfo("ProfessionalData component montado", {
      path: location.pathname,
      progress: progress,
      isCurrentlySubmitting: isSubmitting
    });
    
    // NÃO redirecionar automaticamente - permanecer na rota atual
    // seja ela professional ou professional-data
  }, [location.pathname, progress, isSubmitting]);
  
  const handleSubmit = async (stepId: string, data: any) => {
    logger.logInfo("Dados profissionais enviados:", data);
    await saveStepData(stepId, data);
  };
  
  const handlePrevious = () => {
    logger.logInfo("Navegando para etapa anterior");
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
