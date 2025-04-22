import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { PersonalInfoStep } from "@/components/onboarding/steps/PersonalInfoStep";
import { useNavigate } from "react-router-dom";
import { usePersonalInfoLoad } from "@/hooks/onboarding/usePersonalInfoLoad";
import { usePersonalInfoNavigation } from "@/hooks/onboarding/usePersonalInfoNavigation";
import { usePersonalInfoProgress } from "@/hooks/onboarding/usePersonalInfoProgress";
import { usePersonalInfoStep } from "@/hooks/onboarding/usePersonalInfoStep";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useStepDefinitions } from "@/hooks/onboarding/useStepDefinitions";
import { useStepNavigation } from "@/hooks/onboarding/useStepNavigation";
import { PersonalInfoLoader } from "./PersonalInfoLoader";
import { PersonalInfoError } from "./PersonalInfoError";
import { PersonalInfoForceButton } from "./PersonalInfoForceButton";

const PersonalInfo = () => {
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

  // Log para diagnóstico
  console.log("[DEBUG] PersonalInfo valores:", { isSubmitting, isSaving });

  const {
    loadingAttempts,
    setLoadingAttempts,
    loadError,
    setLoadError,
    progressLoading,
    progress,
    lastError,
    refreshProgress,
    attemptDataLoad
  } = usePersonalInfoLoad();

  // Agora usando o hook de definições de etapas corretamente
  const { steps } = useStepDefinitions();

  // Hook centralizado de navegação de etapas
  const { navigateToStep } = useStepNavigation();

  const { goToNextStep } = usePersonalInfoNavigation();

  const { personalStepIndex, totalSteps, progressPercentage } = usePersonalInfoProgress();

  const navigate = useNavigate();

  // Extrair títulos para o wizard/guia
  const stepTitles = steps.map(s => s.title);

  useEffect(() => {
    // Tentar carregar dados na montagem do componente
    attemptDataLoad(loadInitialData);
    return () => {};
  }, []);

  useEffect(() => {
    // Tentar novamente se estiver carregando por muito tempo
    if (progressLoading && loadingAttempts < 3) {
      const timer = setTimeout(() => {
        attemptDataLoad(loadInitialData);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [progressLoading, loadingAttempts, attemptDataLoad, loadInitialData]);

  useEffect(() => {
    if (progress) {
      // Lógica para atualizar com base no progresso, se necessário
      console.log("[DEBUG] Progresso atualizado:", progress?.id);
    }
  }, [formData, progress]);

  const handleSuccess = async () => {
    // Se a etapa já foi concluída, apenas navegue para a próxima
    if (progress?.completed_steps?.includes("personal")) {
      console.log("[DEBUG] Etapa já concluída, apenas navegando...");
      goToNextStep();
      return;
    }

    // Caso contrário, submeta o formulário normalmente
    const success = await handleSubmit();
    if (success) {
      goToNextStep();
    } else {
      console.log("[DEBUG] Falha ao enviar formulário");
    }
  };

  const handleStepClick = (stepIdx: number) => {
    // Permite navegação livre entre etapas
    navigateToStep(stepIdx);
  };

  const showForceButton = loadingAttempts >= 3 && progressLoading;
  const hasError = loadError || lastError;

  // Verificar se o passo já foi concluído
  const isReadOnly = !!progress?.completed_steps?.includes("personal");

  // Log adicional para diagnóstico do estado
  console.log("[DEBUG] PersonalInfo estados:", {
    isReadOnly,
    progressLoading,
    showForceButton,
    hasError,
    completedSteps: progress?.completed_steps
  });

  if (progressLoading && !showForceButton) {
    return (
      <PersonalInfoLoader
        totalSteps={totalSteps}
        progressPercentage={progressPercentage}
        stepTitles={stepTitles}
        onStepClick={handleStepClick}
      />
    );
  }

  if (hasError) {
    return (
      <PersonalInfoError
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
      <PersonalInfoForceButton
        totalSteps={totalSteps}
        progressPercentage={progressPercentage}
        stepTitles={stepTitles}
        onStepClick={handleStepClick}
        onForceContinue={() => setLoadingAttempts(0)}
        onRetry={() => attemptDataLoad(loadInitialData)}
      />
    );
  }

  // Renderização principal do formulário
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

export default PersonalInfo;
