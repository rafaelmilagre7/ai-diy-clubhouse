
import { useState } from "react";
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
  
  // State for tracking user interactions
  const [hasInteracted, setHasInteracted] = useState(false);
  const [requireUserConfirmation, setRequireUserConfirmation] = useState(true);

  // Track module changes for progress updates
  useModuleChangeTracking(
    moduleIdx, 
    progress?.id, 
    id
  );
  
  // Module completion functionality
  const {
    handleMarkAsCompleted,
    showConfirmationModal,
    setShowConfirmationModal
  } = useModuleCompletion({
    moduleIdx,
    progressId: progress?.id,
    solutionId: id,
    completedModules,
    setCompletedModules,
    modulesLength,
    hasInteracted,
    requireUserConfirmation
  });
  
  // Solution implementation completion
  const {
    isCompleting,
    handleConfirmImplementation
  } = useSolutionCompletion({
    progressId: progress?.id,
    solutionId: id,
    moduleIdx,
    completedModules,
    setCompletedModules
  });
  
  // Set interaction state for the current module
  const setModuleInteraction = (interacted: boolean) => {
    setHasInteracted(interacted);
  };
  
  // Handle module interaction callback
  const handleModuleInteraction = () => {
    setHasInteracted(true);
  };
  
  return {
    moduleIdx,
    isCompleting,
    hasInteracted,
    showConfirmationModal,
    setShowConfirmationModal,
    handleMarkAsCompleted,
    handleConfirmImplementation,
    calculateProgress: () => calculateProgressPercentage(completedModules, modulesLength),
    setModuleInteraction,
    handleModuleInteraction,
    requireUserConfirmation,
    setRequireUserConfirmation
  };
};
