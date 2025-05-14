
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useProgress } from "./useProgress";
import { useStepPersistenceCore } from "./useStepPersistenceCore";
import { steps } from "./useStepDefinitions";
import { useStepNavigation } from "./useStepNavigation";
import { toast } from "sonner";

export const useOnboardingSteps = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    currentStepIndex, 
    navigateToStep: baseNavigateToStep,
    navigateToStepById,
    isProgressLoaded 
  } = useStepNavigation();
  
  const { progress, isLoading, refreshProgress } = useProgress();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mapeamento de rotas para IDs de etapas
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
    "/onboarding/trail-generation": "trail_generation"
  };

  // Verificar a rota atual e ajustar o índice da etapa se necessário
  useEffect(() => {
    const currentPathStepId = pathToStepId[location.pathname as keyof typeof pathToStepId];
    if (currentPathStepId) {
      const stepIndex = steps.findIndex(step => step.id === currentPathStepId);
      if (stepIndex !== -1 && stepIndex !== currentStepIndex) {
        console.log(`[useOnboardingSteps] Sincronizando índice: rota ${location.pathname} mapeada para etapa ${currentPathStepId} (índice ${stepIndex})`);
        baseNavigateToStep(stepIndex);
      }
    }
  }, [location.pathname, currentStepIndex, baseNavigateToStep]);
  
  const { saveStepData: coreSaveStepData, completeOnboarding } = useStepPersistenceCore({
    currentStepIndex,
    setCurrentStepIndex: (idx: number) => baseNavigateToStep(idx),
    navigate,
  });
  
  // Wrapper para o saveStepData que inclui o estado de submissão e melhor tratamento de erros
  const saveStepData = async (stepIdOrData: string | any, dataOrShouldNavigate?: any | boolean, thirdParam?: boolean) => {
    setIsSubmitting(true);
    try {
      console.log(`[useOnboardingSteps] Salvando dados: ${typeof stepIdOrData === 'string' ? stepIdOrData : 'objeto'}`);
      await coreSaveStepData(stepIdOrData, dataOrShouldNavigate, thirdParam);
      
      // Garantir que os dados sejam recarregados após o salvamento
      await refreshProgress();
    } catch (error) {
      console.error("[useOnboardingSteps] Erro ao salvar dados:", error);
      toast.error("Ocorreu um erro ao salvar seus dados. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função melhorada para navegação - pode receber ID ou índice
  const navigateToStep = (indexOrId: number | string) => {
    console.log(`[useOnboardingSteps] Navegando para: ${indexOrId}, tipo: ${typeof indexOrId}`);
    
    if (typeof indexOrId === 'string') {
      // Se for string, assumimos que é um ID
      navigateToStepById(indexOrId);
    } else if (typeof indexOrId === 'number') {
      // Se for número, usamos a navegação baseada em índice
      if (indexOrId >= 0 && indexOrId < steps.length) {
        baseNavigateToStep(indexOrId);
      } else {
        console.error(`[useOnboardingSteps] Índice inválido: ${indexOrId}`);
        toast.error("Não foi possível navegar para a etapa selecionada.");
      }
    } else {
      console.error(`[useOnboardingSteps] Tipo inválido para navegação:`, indexOrId);
      toast.error("Ocorreu um erro na navegação.");
    }
  };

  // Verificar se as condições necessárias para renderização estão satisfeitas
  const isReadyToRender = isProgressLoaded();

  return {
    currentStepIndex,
    currentStep: steps[currentStepIndex],
    steps,
    isSubmitting,
    saveStepData,
    progress,
    isLoading,
    isReadyToRender,
    refreshProgress,
    navigateToStep,
    completeOnboarding
  };
};
