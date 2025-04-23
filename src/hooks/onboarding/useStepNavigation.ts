
import { useEffect, useState } from "react";
import { steps } from "./useStepDefinitions";
import { useProgress } from "./useProgress";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { OnboardingProgress } from "@/types/onboarding";

export const useStepNavigation = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { progress, refreshProgress, isLoading } = useProgress();
  const navigate = useNavigate();
  const location = useLocation();

  const pathToStepId = {
    "/onboarding": "personal",
    "/onboarding/personal-info": "personal",
    "/onboarding/professional": "professional_data",
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
        const refreshedProgress = await refreshProgress();
        
        // Verificar se temos um progresso válido
        const progressData: OnboardingProgress | null = refreshedProgress || progress || null;
        
        // Se não há progresso, redirecionar para o início do onboarding
        if (!progressData) {
          console.log("Nenhum progresso encontrado, redirecionando para o início do onboarding");
          
          // Se estamos na página inicial de onboarding, vamos para a primeira etapa (personal-info)
          if (location.pathname === '/onboarding') {
            console.log("Redirecionando para /onboarding/personal-info");
            navigate("/onboarding/personal-info");
            setCurrentStepIndex(0);
            return;
          }
          
          // Se já estamos em uma página de etapa específica, manter
          if (location.pathname.includes('/onboarding/')) {
            const currentStepId = pathToStepId[location.pathname as keyof typeof pathToStepId];
            if (currentStepId) {
              const index = steps.findIndex(step => step.id === currentStepId);
              if (index !== -1) {
                setCurrentStepIndex(index);
              }
            }
            return;
          }
          
          navigate("/onboarding/personal-info");
          setCurrentStepIndex(0);
          return;
        }
        
        const currentPath = location.pathname;
        const currentStepId = pathToStepId[currentPath as keyof typeof pathToStepId];
        
        if (currentStepId) {
          const stepIndexByPath = steps.findIndex(step => step.id === currentStepId);
          
          if (stepIndexByPath !== -1) {
            console.log(`Definindo etapa atual baseada na URL: ${currentStepId} (índice ${stepIndexByPath})`);
            setCurrentStepIndex(stepIndexByPath);
          }
        } else if (progressData.current_step) {
          const stepIndex = steps.findIndex(step => step.id === progressData.current_step);
          
          if (stepIndex !== -1) {
            console.log(`Continuando onboarding da etapa: ${progressData.current_step} (índice ${stepIndex})`);
            setCurrentStepIndex(stepIndex);
            
            const correctPath = steps[stepIndex].path;
            
            if (currentPath !== correctPath) {
              console.log(`Redirecionando de ${currentPath} para ${correctPath}`);
              navigate(correctPath);
            }
          } else {
            console.warn(`Etapa não encontrada nos passos definidos: ${progressData.current_step}`);
            navigate(steps[0].path);
            toast.info("Iniciando o preenchimento do onboarding");
          }
        } else {
          console.log("Nenhuma etapa atual definida, começando do início");
          navigate(steps[0].path);
        }
      } catch (error) {
        console.error("Erro ao carregar progresso:", error);
      }
    };
    
    loadProgress();
  }, [navigate, refreshProgress, isLoading, location.pathname, progress]);

  const navigateToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      console.log(`Navegando manualmente para etapa índice ${stepIndex}: ${steps[stepIndex].id} (${steps[stepIndex].path})`);
      setCurrentStepIndex(stepIndex);
      navigate(steps[stepIndex].path);
    }
  };

  const navigateToStepById = (stepId: string) => {
    const index = steps.findIndex(step => step.id === stepId);
    if (index !== -1) {
      console.log(`Navegando para etapa ID ${stepId} (índice ${index}): ${steps[index].path}`);
      setCurrentStepIndex(index);
      navigate(steps[index].path);
    }
  };
  
  const navigateToPreviousStep = () => {
    if (currentStepIndex > 0) {
      const previousIndex = currentStepIndex - 1;
      console.log(`Navegando para etapa anterior: ${steps[previousIndex].id}`);
      setCurrentStepIndex(previousIndex);
      navigate(steps[previousIndex].path);
    } else {
      console.log("Já está na primeira etapa, não é possível retornar");
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
