
import { useNavigate } from "react-router-dom";
import { useStepNavigation } from "./useStepNavigation";
import { useProgress } from "./useProgress";
import { toast } from "sonner";

export const usePersonalInfoNavigation = () => {
  const navigate = useNavigate();
  const { currentStepIndex, navigateToStep, progress } = useStepNavigation();
  const { isLoading } = useProgress();

  const goToNextStep = () => {
    try {
      // Verificar se há uma próxima etapa disponível
      const nextStepIndex = currentStepIndex + 1;
      
      if (!isLoading) {
        console.log(`Navegando para próxima etapa (índice ${nextStepIndex})`);
        navigateToStep(nextStepIndex);
      } else {
        toast.info("Aguarde o carregamento dos dados...");
      }
    } catch (error) {
      console.error("Erro ao navegar para próxima etapa:", error);
      toast.error("Erro ao navegar para próxima etapa");
    }
  };

  const goToPreviousStep = () => {
    try {
      // Verificar se há uma etapa anterior disponível
      if (currentStepIndex > 0) {
        const prevStepIndex = currentStepIndex - 1;
        
        if (!isLoading) {
          console.log(`Navegando para etapa anterior (índice ${prevStepIndex})`);
          navigateToStep(prevStepIndex);
        } else {
          toast.info("Aguarde o carregamento dos dados...");
        }
      } else {
        // Já está na primeira etapa, pode-se redirecionar para outra página
        console.log("Já está na primeira etapa, redirecionando para a página inicial");
        navigate("/");
      }
    } catch (error) {
      console.error("Erro ao navegar para etapa anterior:", error);
      toast.error("Erro ao navegar para etapa anterior");
    }
  };

  return {
    goToNextStep,
    goToPreviousStep,
    currentStepIndex,
    isStepCompleted: (stepId: string) => progress?.completed_steps?.includes(stepId) || false
  };
};
