
import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Progress } from "@/lib/supabase";
import { useModuleChangeTracking } from "./useModuleChangeTracking";
import { useModuleCompletion } from "./useModuleCompletion";
import { useSolutionCompletion } from "./useSolutionCompletion";
import { calculateProgressPercentage } from "./utils/progressUtils";

export const useProgressTracking = (
  progress: Progress | null, 
  completedModules: number[], 
  setCompletedModules: (modules: number[]) => void,
  modulesLength: number = 6
) => {
  const { id, moduleIndex } = useParams<{ id: string; moduleIndex: string }>();
  const moduleIdx = parseInt(moduleIndex || "0");
  const { user } = useAuth();

  // FASE 3: Memoizar cálculos pesados
  const progressData = useMemo(() => ({
    progressId: progress?.id,
    solutionId: id,
    moduleIdx,
    currentProgress: calculateProgressPercentage(completedModules, modulesLength)
  }), [progress?.id, id, moduleIdx, completedModules, modulesLength]);
  
  // State for tracking user interactions
  const [hasInteracted, setHasInteracted] = useState(false);
  const [requireUserConfirmation, setRequireUserConfirmation] = useState(true);

  // Track module changes for progress updates (usando dados memoizados)
  useModuleChangeTracking(
    progressData.moduleIdx, 
    progressData.progressId, 
    progressData.solutionId
  );
  
  // Module completion functionality (usando dados memoizados)
  const {
    handleMarkAsCompleted,
    showConfirmationModal,
    setShowConfirmationModal
  } = useModuleCompletion({
    moduleIdx: progressData.moduleIdx,
    progressId: progressData.progressId,
    solutionId: progressData.solutionId,
    completedModules,
    setCompletedModules,
    modulesLength,
    hasInteracted,
    requireUserConfirmation
  });
  
  // Solution implementation completion (usando dados memoizados)
  const {
    isCompleting,
    handleConfirmImplementation
  } = useSolutionCompletion({
    progressId: progressData.progressId,
    solutionId: progressData.solutionId,
    moduleIdx: progressData.moduleIdx,
    completedModules,
    setCompletedModules
  });
  
  // Set interaction state for the current module
  const setModuleInteraction = (interacted: boolean) => {
    setHasInteracted(interacted);
  };
  
  // FASE 3: Retornar dados otimizados e memoizados
  return {
    moduleIdx: progressData.moduleIdx,
    isCompleting,
    hasInteracted,
    showConfirmationModal,
    setShowConfirmationModal,
    handleMarkAsCompleted,
    handleConfirmImplementation,
    calculateProgress: () => progressData.currentProgress,
    setModuleInteraction,
    requireUserConfirmation,
    setRequireUserConfirmation,
    // Dados memoizados para componentes filhos
    progressData
  };
};
