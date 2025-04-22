
import { useProgress } from "./useProgress";
import { buildUpdateObject } from "./persistence/stepDataBuilder";
import { navigateAfterStep } from "./persistence/stepNavigator";
import { steps } from "./useStepDefinitions";
import { toast } from "sonner";
import { useLogging } from "@/hooks/useLogging";

export function useStepPersistenceCore({
  currentStepIndex,
  setCurrentStepIndex,
  navigate,
}: {
  currentStepIndex: number;
  setCurrentStepIndex: (i: number) => void;
  navigate: (path: string) => void;
}) {
  const { progress, updateProgress, refreshProgress } = useProgress();
  const { logError } = useLogging();

  const saveStepData = async (
    stepIdOrData: string | any,
    shouldNavigateOrData?: boolean | any,
    thirdParam?: boolean
  ): Promise<void> => {
    if (!progress?.id) {
      console.error("Dados profissionais não salvos: ID de progresso não encontrado");
      toast.error("Erro ao salvar dados profissionais");
      return;
    }

    let stepId: string;
    let data: any;
    let shouldNavigate: boolean = true;

    if (typeof stepIdOrData === 'string') {
      stepId = stepIdOrData;
      data = shouldNavigateOrData;
      shouldNavigate = thirdParam !== undefined ? thirdParam : true;
    } else {
      stepId = steps[currentStepIndex]?.id || '';
      data = stepIdOrData;
      shouldNavigate = shouldNavigateOrData !== undefined ? 
                       typeof shouldNavigateOrData === 'boolean' ? shouldNavigateOrData : true 
                       : true;
    }
    
    console.log(`Salvando dados profissionais - Passo: ${stepId}`, data);

    try {
      const updateObj = buildUpdateObject(stepId, data, progress, currentStepIndex);
      
      // Log detalhado do objeto de atualização
      console.log("Objeto de atualização profissional:", updateObj);

      if (Object.keys(updateObj).length === 0) {
        console.warn("Objeto de atualização vazio, nada para salvar");
        toast.warning("Sem dados profissionais para salvar");
        return;
      }

      const updatedProgress = await updateProgress(updateObj);
      console.log("Dados profissionais atualizados com sucesso:", updatedProgress);
      
      await refreshProgress();
      
      toast.success("Dados profissionais salvos com sucesso!");
      
      if (shouldNavigate) {
        const nextRouteMap: {[key: string]: string} = {
          "professional_data": "/onboarding/business-context",
        };
        
        if (nextRouteMap[stepId]) {
          setTimeout(() => {
            navigate(nextRouteMap[stepId]);
          }, 500);
        } else {
          navigateAfterStep(stepId, currentStepIndex, navigate, shouldNavigate);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar dados profissionais:", error);
      logError("save_professional_data_error", { 
        step: stepId, 
        error: error instanceof Error ? error.message : String(error),
        stepIndex: currentStepIndex
      });
      toast.error("Erro ao salvar dados profissionais. Tente novamente.");
      throw error;
    }
  };

  return {
    saveStepData,
  };
}
