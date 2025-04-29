
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useProgress } from "./useProgress";
import { useStepPersistenceCore } from "./useStepPersistenceCore";
import { steps } from "./useStepDefinitions";

export const useOnboardingSteps = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { progress, isLoading, refreshProgress } = useProgress();
  const { saveStepData, completeOnboarding } = useStepPersistenceCore({
    currentStepIndex,
    setCurrentStepIndex,
    navigate,
  });

  // Mapeamento de rotas para índices de etapas
  const routeToStepIndex = {
    "/onboarding": 0,
    "/onboarding/professional-data": 1,
    "/onboarding/business-context": 2,
    "/onboarding/ai-experience": 3,
    "/onboarding/club-goals": 4,
    "/onboarding/customization": 5,
    "/onboarding/complementary": 6,
    "/onboarding/review": 7,
    "/onboarding/trail-generation": 8
  };

  // Determinar o índice atual com base na rota atual primeiro
  useEffect(() => {
    const path = location.pathname;
    if (routeToStepIndex.hasOwnProperty(path)) {
      const index = routeToStepIndex[path as keyof typeof routeToStepIndex];
      console.log(`Definindo etapa ${index} com base na URL: ${path}`);
      setCurrentStepIndex(index);
    } else if (progress?.completed_steps) {
      // Fallback: Determinar com base em etapas completadas
      const lastCompletedStep = progress.completed_steps[progress.completed_steps.length - 1];
      const nextStepIndex = steps.findIndex(step => step.id === lastCompletedStep) + 1;
      if (nextStepIndex < steps.length && nextStepIndex >= 0) {
        setCurrentStepIndex(nextStepIndex);
        console.log(`Definindo etapa ${nextStepIndex} com base no progresso salvo (última concluída: ${lastCompletedStep})`);
      }
    }
  }, [location.pathname, progress?.completed_steps]);

  const navigateToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      console.log(`Navegando para etapa ${index}: ${steps[index].path}`);
      setCurrentStepIndex(index);
      navigate(steps[index].path);
    } else {
      console.warn(`Tentativa de navegação para índice inválido: ${index}`);
    }
  };

  return {
    currentStepIndex,
    currentStep: steps[currentStepIndex] || steps[0],
    steps,
    isSubmitting: false,
    saveStepData,
    progress,
    isLoading,
    refreshProgress,
    navigateToStep,
    completeOnboarding
  };
};
