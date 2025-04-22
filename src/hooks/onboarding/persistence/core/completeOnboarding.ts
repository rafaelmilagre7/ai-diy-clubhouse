
import { steps } from "../../useStepDefinitions";
import { toast } from "sonner";
import { useLogging } from "@/hooks/useLogging";

/**
 * Retorna função para finalizar onboarding
 */
export const createCompleteOnboarding = ({
  progress,
  updateProgress,
  refreshProgress,
  logError,
}: {
  progress: any;
  updateProgress: Function;
  refreshProgress: Function;
  logError: ReturnType<typeof useLogging>["logError"];
}) => {
  return async () => {
    if (!progress?.id) {
      toast.error("Progresso não encontrado. Tente recarregar a página.");
      return;
    }
    try {
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
      logError("complete_onboarding_error", {
        error: error instanceof Error ? error.message : String(error)
      });
      toast.error("Erro ao finalizar onboarding. Por favor, tente novamente.");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    }
  };
};
