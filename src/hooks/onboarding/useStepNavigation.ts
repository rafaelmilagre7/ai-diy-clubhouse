
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

  // Mapear caminhos para IDs de etapas
  const pathToStepId = {
    "/onboarding": "personal",
    "/onboarding/professional-data": "professional_data",
    "/onboarding/business-context": "business_context",
    "/onboarding/ai-experience": "ai_exp",
    "/onboarding/club-goals": "business_goals",
    "/onboarding/customization": "experience_personalization",
    "/onboarding/complementary": "complementary_info",
    "/onboarding/review": "review"
  };

  // Efeito para sincronizar a navegação com o progresso do onboarding
  useEffect(() => {
    const loadProgress = async () => {
      if (isLoading) return; // Evitar múltiplas chamadas durante carregamento
      
      const refreshedProgress = await refreshProgress();
      
      // Determinar etapa atual baseada na rota atual
      const currentPath = location.pathname;
      const currentStepId = pathToStepId[currentPath as keyof typeof pathToStepId];
      
      if (currentStepId) {
        // Encontrar o índice da etapa atual pela URL atual
        const stepIndexByPath = steps.findIndex(step => step.id === currentStepId);
        
        if (stepIndexByPath !== -1) {
          console.log(`Definindo etapa atual baseada na URL: ${currentStepId} (índice ${stepIndexByPath})`);
          setCurrentStepIndex(stepIndexByPath);
        }
      } else if (refreshedProgress?.current_step) {
        // Usar current_step do progresso como fallback
        const stepIndex = steps.findIndex(step => step.id === refreshedProgress.current_step);
        
        if (stepIndex !== -1) {
          console.log(`Continuando onboarding da etapa: ${refreshedProgress.current_step} (índice ${stepIndex})`);
          setCurrentStepIndex(stepIndex);
          
          // Se a URL atual não corresponde à etapa correta, redirecionar
          const correctPath = steps[stepIndex].path;
          
          if (currentPath !== correctPath) {
            console.log(`Redirecionando de ${currentPath} para ${correctPath}`);
            navigate(correctPath);
          }
        } else {
          console.warn(`Etapa não encontrada nos passos definidos: ${refreshedProgress.current_step}`);
          // Fallback para a primeira etapa se não encontrarmos a atual
          navigate(steps[0].path);
          toast.info("Iniciando o preenchimento do onboarding");
        }
      } else if (refreshedProgress) {
        // Se não tiver current_step definido, iniciar da primeira etapa
        console.log("Nenhuma etapa atual definida, começando do início");
        navigate(steps[0].path);
      }
    };
    
    loadProgress();
  }, [navigate, refreshProgress, isLoading, location.pathname]);

  // Função para navegar manualmente para uma etapa específica
  const navigateToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      console.log(`Navegando manualmente para etapa índice ${stepIndex}: ${steps[stepIndex].id} (${steps[stepIndex].path})`);
      setCurrentStepIndex(stepIndex);
      navigate(steps[stepIndex].path);
    }
  };

  // Função para navegar para uma etapa pelo seu ID
  const navigateToStepById = (stepId: string) => {
    const index = steps.findIndex(step => step.id === stepId);
    if (index !== -1) {
      console.log(`Navegando para etapa ID ${stepId} (índice ${index}): ${steps[index].path}`);
      setCurrentStepIndex(index);
      navigate(steps[index].path);
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
