
import { steps } from "../../useStepDefinitions";
import { toast } from "sonner";
import { buildUpdateObject } from "../stepDataBuilder";
import { navigateAfterStep } from "../stepNavigator";
import { useLogging } from "@/hooks/useLogging";
import { savePersonalInfoData } from "../services/personalInfoService";
import { markStepAsCompleted } from "../services/progressService";

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
  const toastShown = { current: false };

  const saveStepData = async (
    stepIdOrData: string | any,
    dataOrShouldNavigate?: any | boolean,
    thirdParam?: boolean,
    allowEdit = false
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
    } else {
      stepId = steps[currentStepIndex]?.id || '';
      data = stepIdOrData;
      shouldNavigate = typeof dataOrShouldNavigate === 'boolean' ? 
                       dataOrShouldNavigate : true;
    }

    if (!allowEdit && progress?.completed_steps?.includes(stepId)) {
      toast.warning("Esta etapa já foi salva e não pode mais ser editada. Se precisar alterar, utilize a revisão ao final.");
      return;
    }

    try {
      let success = false;
      let nextStep = null;
      if (currentStepIndex < steps.length - 1) {
        nextStep = steps[currentStepIndex + 1].id;
      }

      if (stepId === 'personal') {
        if (!progress.user_id) throw new Error("ID de usuário não disponível");
        const result = await savePersonalInfoData(
          progress.id,
          progress.user_id,
          data.personal_info || data,
          logError
        );
        success = result.success;
        if (!success) throw new Error("Falha ao salvar dados pessoais");
      } 
      else {
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
          throw new Error(errorMessage);
        }
        success = true;
      }

      if (success) {
        await markStepAsCompleted(progress.id, stepId, nextStep, logError);
        if (!toastShown.current) {
          toast.success("Dados salvos com sucesso!");
          toastShown.current = true;
        }
        await refreshProgress();
        if (shouldNavigate) {
          navigateAfterStep(stepId, currentStepIndex, navigate, shouldNavigate);
        }
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
