
import React, { useEffect } from "react";
import { ProfessionalDataStep } from "@/components/onboarding/steps/ProfessionalDataStep";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLogging } from "@/hooks/useLogging";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { steps as onboardingSteps } from "@/hooks/onboarding/useStepDefinitions";

const ProfessionalData = () => {
  const logger = useLogging("ProfessionalData");
  const { saveStepData, isSubmitting, navigateToPreviousStep, currentStepIndex, steps } = useOnboardingSteps();
  const { progress } = useProgress();
  const location = useLocation();

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

  // Descobre o índice do passo atual (compatível com ambas rotas)
  const professionalIdx = onboardingSteps.findIndex(
    s => s.id === "professional_data"
  ) || steps?.findIndex?.(s => s.id === "professional_data") || 1;

  return (
    <OnboardingLayout
      title="Dados Profissionais"
      description="Essas informações nos ajudam a personalizar sua experiência e recomendar soluções relevantes para seu perfil empresarial."
      currentStep={professionalIdx + 1}
      totalSteps={onboardingSteps.length}
      progress={((professionalIdx + 1) / onboardingSteps.length) * 100}
      steps={onboardingSteps}
      activeStep="professional_data"
    >
      <ProfessionalDataStep
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        initialData={progress}
        onPrevious={handlePrevious}
        isLastStep={false}
        personalInfo={progress?.personal_info}
      />
    </OnboardingLayout>
  );
};

export default ProfessionalData;
