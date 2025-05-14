
import { MutableRefObject, useCallback } from "react";
import { OnboardingProgress } from "@/types/onboarding";
import { updateOnboardingProgress } from "../persistence/progressPersistence";
import { toast } from "sonner";

export const useProgressUpdate = (
  progress: OnboardingProgress | null,
  setProgress: (progress: OnboardingProgress | null) => void,
  toastShownRef: MutableRefObject<boolean>,
  lastError: MutableRefObject<Error | null>,
  refreshProgress: () => Promise<OnboardingProgress | null>,
  logDebugEvent: (eventName: string, data?: any) => void
) => {
  /**
   * Atualiza o progresso do onboarding
   */
  const updateProgress = useCallback(async (updates: Partial<OnboardingProgress>) => {
    if (!progress?.id) {
      logDebugEvent("updateProgress_noProgress");
      console.error("[ERRO] Tentativa de atualizar sem ID de progresso");
      return { error: new Error("ID de progresso não encontrado") };
    }
    
    try {
      logDebugEvent("updateProgress_start", { 
        progressId: progress.id,
        updates: Object.keys(updates)
      });
      
      // Limpar flag de toast
      toastShownRef.current = false;
      
      // Prepare debug_logs if updating
      let updatesToSend = { ...updates };

      // Adicionar log de debug para rastreamento de alterações
      if (updates.debug_logs === undefined) {
        const debugLog = {
          event: "progress_update",
          timestamp: new Date().toISOString(),
          data: {
            fields_updated: Object.keys(updates),
            update_source: new Error().stack?.split('\n')[2]?.trim() || 'unknown'
          }
        };

        // Garantir que debug_logs é um array
        const existingLogs = Array.isArray(progress.debug_logs) ? progress.debug_logs : [];
        
        // Manter apenas os 20 logs mais recentes
        updatesToSend.debug_logs = [...existingLogs, debugLog].slice(-20);
      }
      
      const { data, error } = await updateOnboardingProgress(progress.id, updatesToSend);
      
      if (error) {
        logDebugEvent("updateProgress_error", { 
          error: error.message,
          progressId: progress.id
        });
        console.error("[ERRO] Falha ao atualizar progresso:", error);
        lastError.current = error;
        
        if (!toastShownRef.current) {
          toast.error("Erro ao salvar suas alterações. Por favor, tente novamente.");
          toastShownRef.current = true;
        }
        
        return { error };
      }
      
      if (data) {
        logDebugEvent("updateProgress_success", { 
          progressId: data.id,
          currentStep: data.current_step
        });
        
        console.log("[DEBUG] Progresso atualizado:", data);
        setProgress(data);
        lastError.current = null;
        
        return { data };
      }
      
      return { error: new Error("Nenhum dado retornado após atualização") };
    } catch (e: any) {
      logDebugEvent("updateProgress_exception", { error: e.message });
      console.error("[ERRO] Exceção ao atualizar progresso:", e);
      lastError.current = e;
      
      if (!toastShownRef.current) {
        toast.error("Erro ao salvar suas alterações. Por favor, tente novamente.");
        toastShownRef.current = true;
      }
      
      return { error: e };
    }
  }, [progress, setProgress, refreshProgress, toastShownRef, lastError, logDebugEvent]);

  return { updateProgress };
};
