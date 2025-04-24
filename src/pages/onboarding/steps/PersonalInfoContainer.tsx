
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PersonalInfoForm } from "@/components/onboarding/steps/forms/PersonalInfoForm";
import { usePersonalInfoStep } from "@/hooks/onboarding/usePersonalInfoStep";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useStepDefinitions } from "@/hooks/onboarding/useStepDefinitions";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { PersonalInfoLoaderSection } from "./PersonalInfoLoaderSection";
import { PersonalInfoErrorSection } from "./PersonalInfoErrorSection";
import { PersonalInfoForceSection } from "./PersonalInfoForceSection";
import { useStepNavigation } from "@/hooks/onboarding/useStepNavigation";
import { usePersonalInfoNavigation } from "@/hooks/onboarding/usePersonalInfoNavigation";
import { usePersonalInfoProgress } from "@/hooks/onboarding/usePersonalInfoProgress";
import { toast } from "sonner";

export const PersonalInfoContainer: React.FC = () => {
  const navigate = useNavigate();
  
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return String(error);
  };
  
  try {
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
    } = useProgress();

    const { steps } = useStepDefinitions();

    const { navigateToStep } = useStepNavigation();
    const { goToNextStep } = usePersonalInfoNavigation();
    const { totalSteps, progressPercentage } = usePersonalInfoProgress();

    const stepTitles = steps.map(s => s.title);

    const errorMessage = getErrorMessage(lastError || loadError);

    useEffect(() => {
      try {
        attemptDataLoad(loadInitialData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (progressLoading && loadingAttempts < 3) {
        const timer = setTimeout(() => {
          try {
            attemptDataLoad(loadInitialData);
          } catch (error) {
            console.error("Erro ao tentar recarregar dados:", error);
          }
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

    const handleStepClick = (stepIdx: number) => {
      try {
        navigateToStep(stepIdx);
      } catch (error) {
        console.error("Erro ao navegar para etapa:", error);
      }
    };

    const showForceButton = loadingAttempts >= 3 && progressLoading;
    const hasError = !!errorMessage;
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
          loadError={getErrorMessage(loadError)}
          lastError={errorMessage}
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
        <PersonalInfoForm
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
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    
    console.error("Erro ao renderizar PersonalInfoContainer:", errorMessage);
    return (
      <div className="p-8 bg-red-50 text-red-900 rounded-md">
        <h2 className="text-xl font-bold mb-4">Erro ao carregar formulário</h2>
        <p>{errorMessage}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }
};

export default PersonalInfoContainer;
