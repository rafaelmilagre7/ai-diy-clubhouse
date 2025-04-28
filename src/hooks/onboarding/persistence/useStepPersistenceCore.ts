import React from "react";
import { useProgress } from "../useProgress";
import { buildUpdateObject } from "./stepDataBuilder";
import { navigateAfterStep } from "./stepNavigator";
import { steps } from "../useStepDefinitions";
import { toast } from "sonner";
import { useLogging } from "@/hooks/useLogging";
import { saveProfessionalData } from "./services/professionalDataService";

/**
 * Hook para gerenciar a persistência de dados das etapas do onboarding
 * Fornece funções para salvar dados e completar o onboarding
 */
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
  const toastShown = React.useRef(false);

  const saveStepData = async (
    stepIdOrData: string | any,
    dataOrShouldNavigate?: any | boolean,
    thirdParam?: boolean
  ): Promise<void> => {
    if (!progress?.id) {
      console.error("ID de progresso não encontrado");
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
    
    console.log(`Salvando dados do passo ${stepId}, índice ${currentStepIndex}:`, data);

    try {
      const updateObj = buildUpdateObject(stepId, data, progress, currentStepIndex);
      if (Object.keys(updateObj).length === 0) {
        console.warn("Objeto de atualização vazio");
        if (!toastShown.current) {
          toast.warning("Sem dados para salvar");
          toastShown.current = true;
        }
        return;
      }

      try {
        if (stepId === 'professional_data') {
          await saveProfessionalData(progress.id, progress.user_id, data);
        }
      } catch (serviceError) {
        console.error(`Erro ao salvar dados específicos (${stepId}):`, serviceError);
      }

      const result = await updateProgress(updateObj);
      
      if (!result || (result as any).error) {
        throw new Error((result as any)?.error?.message || "Erro desconhecido");
      }
      
      if (!toastShown.current) {
        toast.success("Dados salvos com sucesso!");
        toastShown.current = true;
      }
      
      await refreshProgress();
      
      if (shouldNavigate) {
        navigateAfterStep(stepId, currentStepIndex, navigate);
      }
    } catch (error: any) {
      console.error("Erro ao salvar dados:", error);
      logError("save_step_data_error", { 
        step: stepId, 
        error: error instanceof Error ? error.message : String(error),
        stepIndex: currentStepIndex
      });
      if (!toastShown.current) {
        toast.error("Erro ao salvar dados. Por favor, tente novamente.");
        toastShown.current = true;
      }
      throw error;
    }
  };

  const completeOnboarding = async () => {
    if (!progress?.id) {
      toast.error("Progresso não encontrado. Tente recarregar a página.");
      return;
    }
    
    try {
      console.log("Completando onboarding...");
      
      const result = await updateProgress({
        is_completed: true,
        completed_steps: steps.map(s => s.id),
      });
      
      if ((result as any)?.error) {
        throw new Error((result as any).error.message || "Erro ao completar onboarding");
      }
      
      await refreshProgress();
      
      toast.success("Onboarding concluído com sucesso!");
      
      setTimeout(() => {
        window.location.href = "/implementation-trail";
      }, 1000);
    } catch (error: any) {
      console.error("Erro ao completar onboarding:", error);
      logError("complete_onboarding_error", { 
        error: error instanceof Error ? error.message : String(error) 
      });
      toast.error("Erro ao finalizar onboarding. Tente novamente.");
      
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    }
  };

  return {
    saveStepData,
    completeOnboarding,
  };
}
