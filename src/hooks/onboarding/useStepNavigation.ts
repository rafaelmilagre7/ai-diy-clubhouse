
import { useEffect, useState } from "react";
import { steps } from "./useStepDefinitions";
import { useProgress } from "./useProgress";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useStepNavigation = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { progress, refreshProgress } = useProgress();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProgress = async () => {
      const refreshedProgress = await refreshProgress();
      
      if (refreshedProgress?.current_step) {
        // Encontrar o índice da etapa atual no array de steps
        const stepIndex = steps.findIndex(step => step.id === refreshedProgress.current_step);
        
        if (stepIndex !== -1) {
          console.log(`Continuando onboarding da etapa: ${refreshedProgress.current_step}`);
          setCurrentStepIndex(stepIndex);
          
          // Navegar automaticamente para a etapa correta
          navigate(steps[stepIndex].path);
        } else {
          toast.info("Continuando o onboarding");
        }
      }
    };
    
    loadProgress();
  }, [navigate, refreshProgress]);

  return {
    currentStepIndex,
    setCurrentStepIndex,
    progress
  };
};
