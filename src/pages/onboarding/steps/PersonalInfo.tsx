
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

  const { goToNextStep } = usePersonalInfoNavigation();

  const { personalStepIndex, totalSteps, progressPercentage } = usePersonalInfoProgress();

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
    const success = await handleSubmit();
    if (success) {
      goToNextStep();
    } else {
      console.log("[DEBUG] Falha ao enviar formulário");
    }
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
      <OnboardingLayout 
        currentStep={1} 
        totalSteps={totalSteps}
        title="Dados Pessoais" 
        backUrl="/"
        progress={progressPercentage}
      >
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size={10} />
          <p className="ml-4 text-gray-400">Carregando seus dados...</p>
        </div>
      </OnboardingLayout>
    );
  }

  if (hasError) {
    return (
      <OnboardingLayout 
        currentStep={1}
        totalSteps={totalSteps}
        title="Dados Pessoais" 
        backUrl="/"
        progress={progressPercentage}
      >
        <div className="space-y-6">
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              {loadError || (lastError ? "Erro ao carregar dados de progresso." : "")}
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center mt-6">
            <button 
              onClick={() => attemptDataLoad(loadInitialData)}
              className="px-4 py-2 bg-[#0ABAB5] text-white rounded hover:bg-[#0ABAB5]/90"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  if (showForceButton) {
    return (
      <OnboardingLayout 
        currentStep={1}
        totalSteps={totalSteps}
        title="Dados Pessoais" 
        backUrl="/"
        progress={progressPercentage}
      >
        <div className="space-y-6">
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="ml-2 text-yellow-700">
              Estamos tendo dificuldades para carregar seus dados. Você pode continuar mesmo assim ou tentar novamente.
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center mt-6 space-x-4">
            <button 
              onClick={() => {
                toast.info("Continuando com dados padrão");
                setLoadingAttempts(0);
              }}
              className="px-4 py-2 bg-[#0ABAB5] text-white rounded hover:bg-[#0ABAB5]/90"
            >
              Continuar Mesmo Assim
            </button>
            <button 
              onClick={() => attemptDataLoad(loadInitialData)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </OnboardingLayout>
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
    </OnboardingLayout>
  );
};

export default PersonalInfo;
