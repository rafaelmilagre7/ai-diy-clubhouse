
import { useEffect, useState } from "react";
import { steps } from "./useStepDefinitions";
import { useProgress } from "./useProgress";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { OnboardingProgress } from "@/types/onboarding";
import { useLogging } from "@/hooks/useLogging";

export const useStepNavigation = () => {
  const logger = useLogging("StepNavigation");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { progress, refreshProgress, isLoading } = useProgress();
  const navigate = useNavigate();
  const location = useLocation();

  // Mapeamento de caminhos para IDs de etapas
  const pathToStepId: Record<string, string> = {
    "/onboarding": "personal",
    "/onboarding/personal-info": "personal",
    "/onboarding/professional": "professional_data", // Mapear a rota antiga para o ID correto
    "/onboarding/professional-data": "professional_data",
    "/onboarding/business-context": "business_context",
    "/onboarding/ai-experience": "ai_exp",
    "/onboarding/club-goals": "business_goals",
    "/onboarding/customization": "experience_personalization",
    "/onboarding/complementary": "complementary_info",
    "/onboarding/review": "review"
  };

  useEffect(() => {
    const loadProgress = async () => {
      if (isLoading) return; // Evitar múltiplas chamadas durante carregamento
      
      try {
        logger.logInfo("Carregando progresso do onboarding, path atual:", location.pathname);
        const refreshedProgress = await refreshProgress();
        
        // Verificar se temos um progresso válido
        const progressData: OnboardingProgress | null = refreshedProgress || progress || null;
        
        // Se não há progresso, redirecionar para o início do onboarding
        if (!progressData) {
          logger.logInfo("Nenhum progresso encontrado, redirecionando para o início do onboarding");
          
          // Se já estamos em uma página de etapa específica, manter
          if (location.pathname.includes('/onboarding/')) {
            const currentStepId = pathToStepId[location.pathname];
            if (currentStepId) {
              const index = steps.findIndex(step => step.id === currentStepId);
              if (index !== -1) {
                logger.logInfo(`Definindo índice de etapa atual para ${index} com base no caminho: ${location.pathname}`);
                setCurrentStepIndex(index);
              }
            }
            return;
          }
          
          navigate("/onboarding");
          setCurrentStepIndex(0);
          return;
        }
        
        const currentPath = location.pathname;
        const currentStepId = pathToStepId[currentPath];
        
        if (currentStepId) {
          const stepIndexByPath = steps.findIndex(step => step.id === currentStepId);
          
          if (stepIndexByPath !== -1) {
            logger.logInfo(`Definindo etapa atual baseada na URL: ${currentStepId} (índice ${stepIndexByPath})`);
            setCurrentStepIndex(stepIndexByPath);
            
            // Importante: NÃO redirecionar mais se a URL já for uma das 
            // rotas válidas (professional ou professional-data)
            return;
          }
        } else if (progressData.current_step) {
          const stepIndex = steps.findIndex(step => step.id === progressData.current_step);
          
          if (stepIndex !== -1) {
            logger.logInfo(`Continuando onboarding da etapa: ${progressData.current_step} (índice ${stepIndex})`);
            setCurrentStepIndex(stepIndex);
            
            // IMPORTANTE: Não redirecionar para evitar loops
          } else {
            logger.logWarning(`Etapa não encontrada nos passos definidos: ${progressData.current_step}`);
            navigate(steps[0].path);
            toast.info("Iniciando o preenchimento do onboarding");
          }
        } else {
          logger.logInfo("Nenhuma etapa atual definida, começando do início");
          navigate(steps[0].path);
        }
      } catch (error) {
        logger.logError("Erro ao carregar progresso:", error);
      }
    };
    
    loadProgress();
  }, [navigate, refreshProgress, isLoading, location.pathname, progress]);

  const navigateToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      logger.logInfo(`Navegando manualmente para etapa índice ${stepIndex}: ${steps[stepIndex].id} (${steps[stepIndex].path})`);
      setCurrentStepIndex(stepIndex);
      navigate(steps[stepIndex].path);
    }
  };

  const navigateToStepById = (stepId: string) => {
    const index = steps.findIndex(step => step.id === stepId);
    if (index !== -1) {
      logger.logInfo(`Navegando para etapa ID ${stepId} (índice ${index}): ${steps[index].path}`);
      setCurrentStepIndex(index);
      navigate(steps[index].path);
    }
  };
  
  const navigateToPreviousStep = () => {
    if (currentStepIndex > 0) {
      const previousIndex = currentStepIndex - 1;
      logger.logInfo(`Navegando para etapa anterior: ${steps[previousIndex].id}`);
      setCurrentStepIndex(previousIndex);
      navigate(steps[previousIndex].path);
    } else {
      logger.logInfo("Já está na primeira etapa, não é possível retornar");
    }
  };

  return {
    currentStepIndex,
    setCurrentStepIndex,
    progress,
    navigateToStep,
    navigateToStepById,
    navigateToPreviousStep,
    isLoading,
    currentStep: steps[currentStepIndex] || steps[0]
  };
};
