
import { MutableRefObject, useCallback } from "react";
import { OnboardingProgress } from "@/types/onboarding";
import { refreshOnboardingProgress } from "../persistence/progressPersistence";
import { toast } from "sonner";

export const useProgressRefresh = (
  progress: OnboardingProgress | null,
  setProgress: (progress: OnboardingProgress | null) => void,
  isMounted: MutableRefObject<boolean>,
  lastError: MutableRefObject<Error | null>,
  logDebugEvent: (eventName: string, data?: any) => void
) => {
  /**
   * Recarrega os dados do progresso do banco de dados
   */
  const refreshProgress = useCallback(async (): Promise<OnboardingProgress | null> => {
    if (!progress?.id) {
      logDebugEvent("refreshProgress_noProgress");
      console.error("[ERRO] Tentativa de recarregar sem ID de progresso");
      return null;
    }
    
    try {
      logDebugEvent("refreshProgress_start", { progressId: progress.id });
      
      const { data, error } = await refreshOnboardingProgress(progress.id);
      
      if (!isMounted.current) {
        return null;
      }
      
      if (error) {
        logDebugEvent("refreshProgress_error", { error: error.message });
        console.error("[ERRO] Falha ao recarregar progresso:", error);
        lastError.current = error;
        toast.error("Erro ao recarregar seus dados. Por favor, tente novamente.");
        return null;
      }
      
      if (!data) {
        logDebugEvent("refreshProgress_noData");
        console.error("[ERRO] Nenhum dado retornado ao recarregar");
        return null;
      }
      
      logDebugEvent("refreshProgress_success", { 
        progressId: data.id, 
        currentStep: data.current_step 
      });
      
      console.log("[DEBUG] Progresso recarregado:", data);
      setProgress(data);
      lastError.current = null;
      
      return data;
    } catch (e: any) {
      logDebugEvent("refreshProgress_exception", { error: e.message });
      console.error("[ERRO] Exceção ao recarregar progresso:", e);
      lastError.current = e;
      toast.error("Erro ao recarregar seus dados. Por favor, tente novamente.");
      return null;
    }
  }, [progress, setProgress, isMounted, lastError, logDebugEvent]);

  return { refreshProgress };
};
