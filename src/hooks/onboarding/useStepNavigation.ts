
import { useEffect, useState } from "react";
import { steps } from "./useStepDefinitions";
import { useProgress } from "./useProgress";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

export const useStepNavigation = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { progress, refreshProgress, isLoading } = useProgress();
  const navigate = useNavigate();
  const location = useLocation();

  const pathToStepId = {
    "/onboarding": "personal",
    "/onboarding/professional-data": "professional_data",
    "/onboarding/business-context": "business_context",
    "/onboarding/ai-experience": "ai_exp",
    "/onboarding/club-goals": "business_goals",
    "/onboarding/customization": "experience_personalization",
    "/onboarding/complementary": "complementary_info",
    "/onboarding/review": "review",
    "/onboarding/trail-generation": "trail_generation"
  };

  useEffect(() => {
    const loadProgress = async () => {
      if (isLoading) return;
      
      const refreshedProgress = await refreshProgress();
      console.log("Progresso atualizado:", refreshedProgress);
      
      const currentPath = location.pathname;
      const currentStepId = pathToStepId[currentPath as keyof typeof pathToStepId];
      
      if (currentStepId) {
        const stepIndexByPath = steps.findIndex(step => step.id === currentStepId);
        
        if (stepIndexByPath !== -1) {
          console.log(`Definindo etapa baseada na URL: ${currentStepId} (índice ${stepIndexByPath})`);
          setCurrentStepIndex(stepIndexByPath);
        }
      } else if (refreshedProgress && refreshedProgress.current_step) {
        const stepIndex = steps.findIndex(step => step.id === refreshedProgress.current_step);
        
        if (stepIndex !== -1) {
          console.log(`Continuando onboarding da etapa: ${refreshedProgress.current_step}`);
          setCurrentStepIndex(stepIndex);
          
          const correctPath = steps[stepIndex].path;
          
          if (currentPath !== correctPath) {
            console.log(`Redirecionando de ${currentPath} para ${correctPath}`);
            navigate(correctPath, { replace: true }); // Usando replace para evitar histórico indesejado
          }
        } else {
          console.warn(`Etapa não encontrada: ${refreshedProgress.current_step}`);
          navigate(steps[0].path, { replace: true });
          toast.info("Iniciando preenchimento do onboarding");
        }
      } else if (refreshedProgress) {
        console.log("Nenhuma etapa definida, começando do início");
        navigate(steps[0].path, { replace: true });
      }
    };
    
    loadProgress();
  }, [navigate, refreshProgress, isLoading, location.pathname]);

  const navigateToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      console.log(`Navegando para etapa ${stepIndex}: ${steps[stepIndex].id}`);
      setCurrentStepIndex(stepIndex);
      navigate(steps[stepIndex].path, { replace: true });
    }
  };

  const navigateToStepById = (stepId: string) => {
    const index = steps.findIndex(step => step.id === stepId);
    if (index !== -1) {
      console.log(`Navegando para etapa ID ${stepId}`);
      setCurrentStepIndex(index);
      navigate(steps[index].path, { replace: true });
    }
  };

  return {
    currentStepIndex,
    setCurrentStepIndex,
    progress,
    navigateToStep,
    navigateToStepById,
    isLoading,
    currentStep: steps[currentStepIndex] || steps[0]
  };
};
