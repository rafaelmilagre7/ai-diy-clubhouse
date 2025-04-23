
import { useLogging } from "@/hooks/useLogging";
import { markStepAsCompleted } from "../services/progressService";
import { toast } from "sonner";

interface CompleteOnboardingParams {
  progress: any;
  updateProgress: Function;
  refreshProgress: Function;
  logError: ReturnType<typeof useLogging>["logError"];
}

export const createCompleteOnboarding = ({
  progress,
  updateProgress,
  refreshProgress,
  logError,
}: CompleteOnboardingParams) => {
  const completeOnboarding = async () => {
    if (!progress?.id) {
      toast.error("Progresso não encontrado. Tente recarregar a página.");
      return false;
    }
    
    try {
      console.log("Completando onboarding...");
      
      // Marca o onboarding como concluído
      const result = await updateProgress({
        is_completed: true,
      });
      
      if ((result as any)?.error) {
        const errorMessage = (result as any).error.message || "Erro ao completar onboarding";
        logError('complete_onboarding_error', { 
          error: errorMessage 
        });
        throw new Error(errorMessage);
      }
      
      // Atualiza os status de todas as etapas como concluídas
      await markStepAsCompleted(
        progress.id,
        "review",  // A última etapa
        "dashboard", // Próxima página após conclusão
        logError
      );
      
      // Atualiza dados locais
      await refreshProgress();
      console.log("Onboarding marcado como completo, preparando redirecionamento...");
      
      toast.success("Onboarding concluído com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Erro ao completar onboarding:", error);
      logError("complete_onboarding_error", { 
        error: error instanceof Error ? error.message : String(error) 
      });
      toast.error("Erro ao finalizar onboarding. Por favor, tente novamente.");
      return false;
    }
  };

  return completeOnboarding;
};
