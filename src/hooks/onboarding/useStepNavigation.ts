
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

  // Mapeamento unificado de caminhos para IDs de etapa
  const pathToStepId = {
    "/onboarding": "personal_info",
    "/onboarding/personal-info": "personal_info",
    "/onboarding/professional-data": "professional_info",
    "/onboarding/business-context": "business_context",
    "/onboarding/ai-experience": "ai_experience",
    "/onboarding/club-goals": "business_goals",
    "/onboarding/customization": "experience_personalization",
    "/onboarding/complementary": "complementary_info",
    "/onboarding/review": "review",
    "/onboarding/trail-generation": "trail_generation",
    // Rotas de formação
    "/onboarding/formacao": "personal_info",
    "/onboarding/formacao/personal-info": "personal_info",
    "/onboarding/formacao/ai-experience": "ai_experience",
    "/onboarding/formacao/goals": "learning_goals",
    "/onboarding/formacao/preferences": "learning_preferences",
    "/onboarding/formacao/review": "review"
  };

  // Mapeamento reverso para navegação
  const stepIdToPath = {
    "personal_info": "/onboarding/personal-info",
    "professional_info": "/onboarding/professional-data",
    "business_context": "/onboarding/business-context",
    "ai_experience": "/onboarding/ai-experience",
    "business_goals": "/onboarding/club-goals",
    "experience_personalization": "/onboarding/customization",
    "complementary_info": "/onboarding/complementary",
    "review": "/onboarding/review",
    "trail_generation": "/onboarding/trail-generation",
    // Formação
    "learning_goals": "/onboarding/formacao/goals",
    "learning_preferences": "/onboarding/formacao/preferences"
  };

  useEffect(() => {
    const loadProgress = async () => {
      if (isLoading) return; // Evitar múltiplas chamadas durante carregamento
      
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
            navigate(correctPath, { replace: true }); // Usando replace para evitar navegação indesejada de volta
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

  // Função de navegação que usa ID do passo
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

  // Função para verificar se o progresso foi carregado
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
