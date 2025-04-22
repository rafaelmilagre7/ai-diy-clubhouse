
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePersonalInfoStep } from "@/hooks/onboarding/usePersonalInfoStep";
import { usePersonalInfoLoad } from "@/hooks/onboarding/usePersonalInfoLoad";
import { useStepDefinitions } from "@/hooks/onboarding/useStepDefinitions";
import { useStepNavigation } from "@/hooks/onboarding/useStepNavigation";
import { usePersonalInfoNavigation } from "@/hooks/onboarding/usePersonalInfoNavigation";
import { usePersonalInfoProgress } from "@/hooks/onboarding/usePersonalInfoProgress";
import { PersonalInfoLoaderSection } from "./PersonalInfoLoaderSection";
import { PersonalInfoErrorSection } from "./PersonalInfoErrorSection";
import { PersonalInfoForceSection } from "./PersonalInfoForceSection";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { PersonalInfoStep } from "@/components/onboarding/steps/PersonalInfoStep";
import { toast } from "sonner";

export const PersonalInfoContainer: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    isSaving,
    lastSaveTime,
    loadInitialData
  } = usePersonalInfoStep();

  const {
    loadingAttempts,
    setLoadingAttempts,
    loadError,
    progressLoading,
    progress,
    lastError,
    attemptDataLoad
  } = usePersonalInfoLoad();

  const { steps } = useStepDefinitions();

  const { navigateToStep } = useStepNavigation();
  const { goToNextStep } = usePersonalInfoNavigation();
  const { totalSteps, progressPercentage } = usePersonalInfoProgress();

  // Extrair títulos para o wizard
  const stepTitles = steps.map(s => s.title);

  useEffect(() => {
    attemptDataLoad(loadInitialData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (progressLoading && loadingAttempts < 3) {
      const timer = setTimeout(() => {
        attemptDataLoad(loadInitialData);
      }, 5000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressLoading, loadingAttempts]);

  const handleSuccess = async () => {
    console.log("handleSuccess chamado no PersonalInfoContainer");
    if (progress?.completed_steps?.includes("personal")) {
      console.log("Etapa já concluída, indo para próxima etapa");
      goToNextStep();
      return;
    }
    
    console.log("Tentando submeter formulário");
    try {
      const success = await handleSubmit();
      console.log("Resultado da submissão:", success);
      
      if (success) {
        console.log("Submissão bem-sucedida, navegando para próxima etapa");
        setTimeout(() => {
          navigate("/onboarding/professional-data");
        }, 800);
      }
    } catch (error) {
      console.error("Erro ao processar submissão:", error);
      toast.error("Erro ao processar dados. Por favor, tente novamente.");
    }
  };

  const handleStepClick = (stepIdx: number) => navigateToStep(stepIdx);

  const showForceButton = loadingAttempts >= 3 && progressLoading;
  const hasError = loadError || lastError;
  const isReadOnly = !!progress?.completed_steps?.includes("personal");

  if (progressLoading && !showForceButton) {
    return (
      <PersonalInfoLoaderSection
        totalSteps={totalSteps}
        progressPercentage={progressPercentage}
        stepTitles={stepTitles}
        onStepClick={handleStepClick}
      />
    );
  }

  if (hasError) {
    return (
      <PersonalInfoErrorSection
        totalSteps={totalSteps}
        progressPercentage={progressPercentage}
        stepTitles={stepTitles}
        onStepClick={handleStepClick}
        loadError={loadError}
        lastError={lastError}
        onRetry={() => attemptDataLoad(loadInitialData)}
      />
    );
  }

  if (showForceButton) {
    return (
      <PersonalInfoForceSection
        totalSteps={totalSteps}
        progressPercentage={progressPercentage}
        stepTitles={stepTitles}
        onStepClick={handleStepClick}
        onForceContinue={() => setLoadingAttempts(0)}
        onRetry={() => attemptDataLoad(loadInitialData)}
      />
    );
  }

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={totalSteps}
      title="Dados Pessoais"
      backUrl="/"
      progress={progressPercentage}
      stepTitles={stepTitles}
      onStepClick={handleStepClick}
    >
      <PersonalInfoStep
        onSubmit={handleSuccess}
        isSubmitting={isSubmitting}
        formData={formData}
        errors={errors}
        onChange={handleChange}
        isSaving={isSaving}
        lastSaveTime={lastSaveTime}
        readOnly={isReadOnly}
      />
      <div className="mt-8 flex justify-center">
        <p className="text-xs text-gray-400">
          Você pode clicar em qualquer etapa acima para avançar ou retornar sem seguir uma ordem específica.
        </p>
      </div>
    </OnboardingLayout>
  );
};
