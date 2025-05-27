
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

  // Mapeamento simplificado para o onboarding NOVO
  const pathToStepId = {
    "/onboarding": "personal_info",
    "/onboarding/personal-info": "personal_info",
    "/onboarding/ai-experience": "ai_experience",
    "/onboarding/trail-generation": "trail_generation"
  };

  // Mapeamento reverso para navegação
  const stepIdToPath = {
    "personal_info": "/onboarding/personal-info",
    "ai_experience": "/onboarding/ai-experience", 
    "trail_generation": "/onboarding/trail-generation"
  };

  useEffect(() => {
    const loadProgress = async () => {
      if (isLoading) return;
      
      const refreshedProgress = await refreshProgress();
      
      const currentPath = location.pathname;
      const currentStepId = pathToStepId[currentPath as keyof typeof pathToStepId];
      
      console.log(`[useStepNavigation] Caminho atual: ${currentPath}, ID de etapa mapeado: ${currentStepId}`);
      
      if (currentStepId) {
        const stepIndexByPath = steps.findIndex(step => step.id === currentStepId);
        
        if (stepIndexByPath !== -1) {
          console.log(`[useStepNavigation] Definindo etapa atual baseada na URL: ${currentStepId} (índice ${stepIndexByPath})`);
          setCurrentStepIndex(stepIndexByPath);
        }
      } else if (refreshedProgress && refreshedProgress.current_step) {
        const stepIndex = steps.findIndex(step => step.id === refreshedProgress.current_step);
        
        if (stepIndex !== -1) {
          console.log(`[useStepNavigation] Continuando onboarding da etapa: ${refreshedProgress.current_step} (índice ${stepIndex})`);
          setCurrentStepIndex(stepIndex);
          
          const correctPath = steps[stepIndex].path;
          
          if (currentPath !== correctPath) {
            console.log(`[useStepNavigation] Redirecionando de ${currentPath} para ${correctPath}`);
            navigate(correctPath, { replace: true });
          }
        } else {
          console.warn(`[useStepNavigation] Etapa não encontrada nos passos definidos: ${refreshedProgress.current_step}`);
          navigate(steps[0].path, { replace: true });
          toast.info("Iniciando o preenchimento do onboarding");
        }
      } else if (refreshedProgress) {
        console.log("[useStepNavigation] Nenhuma etapa atual definida, começando do início");
        navigate(steps[0].path, { replace: true });
      }
    };
    
    loadProgress();
  }, [navigate, refreshProgress, isLoading, location.pathname]);

  const navigateToStepById = (stepId: string) => {
    const index = steps.findIndex(step => step.id === stepId);
    
    if (index !== -1) {
      console.log(`[useStepNavigation] Navegando para etapa ID ${stepId} (índice ${index}): ${steps[index].path}`);
      
      const targetPath = stepIdToPath[stepId as keyof typeof stepIdToPath] || steps[index].path;
      
      setCurrentStepIndex(index);
      navigate(targetPath);
    } else {
      console.warn(`[useStepNavigation] Etapa não encontrada com ID: ${stepId}`);
    }
  };

  const navigateToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      const targetStepId = steps[stepIndex].id;
      const targetPath = stepIdToPath[targetStepId as keyof typeof stepIdToPath] || steps[stepIndex].path;
      
      console.log(`[useStepNavigation] Navegando para etapa índice ${stepIndex}: ${targetStepId} (${targetPath})`);
      setCurrentStepIndex(stepIndex);
      navigate(targetPath);
    } else {
      console.warn(`[useStepNavigation] Tentativa de navegação para índice inválido: ${stepIndex}`);
    }
  };

  const isProgressLoaded = () => {
    return progress !== null && !isLoading;
  };

  return {
    currentStepIndex,
    setCurrentStepIndex,
    progress,
    navigateToStep,
    navigateToStepById,
    isLoading,
    isProgressLoaded,
    currentStep: steps[currentStepIndex] || steps[0]
  };
};
