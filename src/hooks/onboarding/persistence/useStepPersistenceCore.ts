
import React from "react";
import { useProgress } from "../useProgress";
import { useLogging } from "@/hooks/useLogging";
import { createSaveStepData, createCompleteOnboarding } from "./core";

/**
 * Hook para gerenciar a persistência de dados das etapas do onboarding (refatorado)
 */
export function useStepPersistenceCore({
  currentStepIndex,
  setCurrentStepIndex,
  navigate,
}: {
  currentStepIndex: number;
  setCurrentStepIndex: (i: number) => void;
  navigate: (path: string) => void;
}) {
  const { progress, updateProgress, refreshProgress } = useProgress();
  const { logError } = useLogging();

  // Funções reutilizáveis do core
  const saveStepData = React.useMemo(
    () =>
      createSaveStepData({
        progress,
        updateProgress,
        refreshProgress,
        currentStepIndex,
        navigate,
        logError
      }),
    // eslint-disable-next-line
    [progress?.id, currentStepIndex, navigate]
  );

  const completeOnboarding = React.useMemo(
    () =>
      createCompleteOnboarding({
        progress,
        updateProgress,
        refreshProgress,
        logError,
      }),
    // eslint-disable-next-line
    [progress?.id]
  );

  return {
    saveStepData,
    completeOnboarding,
  };
}
