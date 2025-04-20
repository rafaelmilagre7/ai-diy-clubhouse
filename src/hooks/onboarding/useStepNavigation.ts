
import { useEffect, useState } from "react";
import { steps } from "./useStepDefinitions";
import { useProgress } from "./useProgress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useStepNavigation = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { progress, refreshProgress } = useProgress();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProgress = async () => {
      const refreshedProgress = await refreshProgress();
      if (refreshedProgress?.completed_steps) {
        const lastCompletedIndex = Math.max(
          ...refreshedProgress.completed_steps.map(step => 
            steps.findIndex(s => s.id === step)
          ).filter(index => index !== -1), 
          -1
        );
        setCurrentStepIndex(lastCompletedIndex !== -1 ? Math.min(lastCompletedIndex + 1, steps.length - 1) : 0);
      }
    };
    loadProgress();
  }, [refreshProgress]);

  useEffect(() => {
    const path = window.location.pathname;
    const index = steps.findIndex(step => step.path === path);
    if (index !== -1) {
      setCurrentStepIndex(index);
    }
  }, []);

  const navigateToStep = (stepIndex: number) => {
    if (!progress) return;
    if (stepIndex >= 0 && stepIndex < steps.length) {
      const lastCompletedIndex = Math.max(
        ...(progress?.completed_steps || []).map(step => 
          steps.findIndex(s => s.id === step)
        ).filter(index => index !== -1),
        -1
      );
      const maxAllowedIndex = lastCompletedIndex + 1;
      if (stepIndex <= maxAllowedIndex) {
        const targetStep = steps[stepIndex];
        if (targetStep && targetStep.path) {
          setCurrentStepIndex(stepIndex);
          navigate(targetStep.path);
        }
      } else {
        toast.error("Complete as etapas anteriores primeiro.");
      }
    }
  };

  return {
    steps,
    currentStepIndex,
    setCurrentStepIndex,
    navigateToStep,
    navigate
  };
};
