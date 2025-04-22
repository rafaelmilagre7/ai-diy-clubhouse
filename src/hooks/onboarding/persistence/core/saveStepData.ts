
import { steps } from "../../useStepDefinitions";
import { toast } from "sonner";
import { buildUpdateObject } from "../stepDataBuilder";
import { navigateAfterStep } from "../stepNavigator";
import { useLogging } from "@/hooks/useLogging";

interface SaveStepDataParams {
  progress: any;
  updateProgress: Function;
  refreshProgress: Function;
  currentStepIndex: number;
  navigate: (path: string) => void;
  logError: ReturnType<typeof useLogging>["logError"];
}

export const createSaveStepData = ({
  progress,
  updateProgress,
  refreshProgress,
  currentStepIndex,
  navigate,
  logError,
}: SaveStepDataParams) => {
  // Flag global para não exibir múltiplos toasts
  const toastShown = { current: false };

  /**
   * Função principal para salvar dados de um passo específico
   */
  const saveStepData = async (
    stepIdOrData: string | any,
    dataOrShouldNavigate?: any | boolean,
    thirdParam?: boolean
  ): Promise<void> => {
    if (!progress?.id) {
      console.error("Não foi possível salvar dados: ID de progresso não encontrado");
      toast.error("Erro ao salvar dados: ID de progresso não encontrado");
      return;
    }
    toastShown.current = false;

    let stepId: string;
    let data: any;
    let shouldNavigate: boolean = true;

    if (typeof stepIdOrData === 'string') {
      stepId = stepIdOrData;
      data = dataOrShouldNavigate;
      shouldNavigate = thirdParam !== undefined ? thirdParam : true;
      console.log(`saveStepData (refatorado) chamado com stepId='${stepId}', shouldNavigate=${shouldNavigate}`);
    } else {
      stepId = steps[currentStepIndex]?.id || '';
      data = stepIdOrData;
      shouldNavigate = typeof dataOrShouldNavigate === 'boolean' ? dataOrShouldNavigate : true;
      console.log(`saveStepData (refatorado) chamado como modo indexado, stepId='${stepId}'`);
    }

    try {
      const updateObj = buildUpdateObject(stepId, data, progress, currentStepIndex);
      if (Object.keys(updateObj).length === 0) {
        if (!toastShown.current) {
          toast.warning("Sem dados para salvar");
          toastShown.current = true;
        }
        return;
      }
      const result = await updateProgress(updateObj);

      if (!result || (result as any).error) {
        const errorMessage = (result as any)?.error?.message || "Erro desconhecido ao atualizar dados";
        logError("save_step_data_error", {
          step: stepId,
          error: errorMessage,
          stepIndex: currentStepIndex
        });
        if (!toastShown.current) {
          toast.error("Erro ao salvar dados. Por favor, tente novamente.");
          toastShown.current = true;
        }
        return;
      }

      if (!toastShown.current) {
        toast.success("Dados salvos com sucesso!");
        toastShown.current = true;
      }
      await refreshProgress();

      if (shouldNavigate) {
        navigateAfterStep(stepId, currentStepIndex, navigate, shouldNavigate);
      }
    } catch (error: any) {
      logError("save_step_data_error", {
        step: stepId,
        error: error instanceof Error ? error.message : String(error),
        stepIndex: currentStepIndex,
      });
      if (!toastShown.current) {
        toast.error("Erro ao salvar dados. Por favor, tente novamente.");
        toastShown.current = true;
      }
      throw error;
    }
  };

  return saveStepData;
};
