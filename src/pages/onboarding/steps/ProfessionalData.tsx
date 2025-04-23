
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
  
  // Verificar se estamos na rota antiga e redirecionar se necessário
  useEffect(() => {
    console.log("ProfessionalData component montado, path atual:", location.pathname);
    
    if (location.pathname === "/onboarding/professional") {
      // Mostrar um toast informativo sobre o redirecionamento
      toast.info("Redirecionando para a nova URL...");
      console.log("Redirecionando de /onboarding/professional para /onboarding/professional-data");
      
      // Redirecionar para a nova rota com replace para não adicionar à história de navegação
      setTimeout(() => {
        navigate("/onboarding/professional-data", { replace: true });
      }, 500);
    }
  }, [location.pathname, navigate]);
  
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
