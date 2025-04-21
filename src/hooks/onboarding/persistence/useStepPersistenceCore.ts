
import { useProgress } from "../useProgress";
import { buildUpdateObject } from "./stepDataBuilder";
import { navigateAfterStep } from "./stepNavigator";
import { steps } from "../useStepDefinitions";

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

  const saveStepData = async (
    stepId: string, 
    data: any
  ) => {
    if (!progress?.id) {
      console.error("Não foi possível salvar dados: ID de progresso não encontrado");
      return;
    }

    try {
      // Montar objeto de atualização para a etapa
      const updateObj = buildUpdateObject(stepId, data, progress, currentStepIndex);
      if (Object.keys(updateObj).length === 0) return;

      // Atualizar no Supabase
      await updateProgress(updateObj);

      // Forçar atualização dos dados local
      await refreshProgress();

      // Navegar para a próxima etapa apropriadamente
      navigateAfterStep(stepId, currentStepIndex, navigate);

    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      // Não exibe toast deliberadamente (Requisito)
    }
  };

  // Finaliza onboarding (marca como completo e leva ao dashboard)
  const completeOnboarding = async () => {
    if (!progress?.id) return;
    try {
      await updateProgress({
        is_completed: true,
        completed_steps: steps.map(s => s.id),
      });
      await refreshProgress();
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      console.error("Erro ao completar onboarding:", error);
    }
  };

  return {
    saveStepData,
    completeOnboarding,
  };
}
