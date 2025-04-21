
import { useEffect, useState } from "react";
import { steps } from "./useStepDefinitions";
import { useProgress } from "./useProgress";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useStepNavigation = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { progress, refreshProgress, isLoading } = useProgress();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProgress = async () => {
      if (isLoading) return; // Evitar múltiplas chamadas durante carregamento
      
      const refreshedProgress = await refreshProgress();
      
      if (refreshedProgress?.current_step) {
        // Encontrar o índice da etapa atual no array de steps
        const stepIndex = steps.findIndex(step => step.id === refreshedProgress.current_step);
        
        if (stepIndex !== -1) {
          console.log(`Continuando onboarding da etapa: ${refreshedProgress.current_step} (índice ${stepIndex})`);
          setCurrentStepIndex(stepIndex);
          
          // Se a URL atual não corresponde à etapa correta, redirecionar
          const currentPath = window.location.pathname;
          const correctPath = steps[stepIndex].path;
          
          if (currentPath !== correctPath) {
            console.log(`Redirecionando de ${currentPath} para ${correctPath}`);
            navigate(correctPath);
          }
        } else {
          console.warn(`Etapa não encontrada nos passos definidos: ${refreshedProgress.current_step}`);
          // Fallback para a primeira etapa se não encontrarmos a atual
          navigate(steps[0].path);
          toast.info("Continuando o onboarding do início");
        }
      } else if (refreshedProgress) {
        // Se não tiver current_step definido, iniciar da primeira etapa
        console.log("Nenhuma etapa atual definida, começando do início");
        navigate(steps[0].path);
      }
    };
    
    loadProgress();
  }, [navigate, refreshProgress, isLoading]);

  // Função para navegar manualmente para uma etapa específica
  const navigateToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStepIndex(stepIndex);
      navigate(steps[stepIndex].path);
    }
  };

  return {
    currentStepIndex,
    setCurrentStepIndex,
    progress,
    navigateToStep,
    isLoading
  };
};
