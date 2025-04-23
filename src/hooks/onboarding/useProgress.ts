
import { useEffect } from "react";
import { OnboardingProgress } from "@/types/onboarding";
import { useAuth } from "@/contexts/auth";
import { getOnboardingProgress } from "./persistence/getOnboardingProgress";
import { useProgressState } from "./progress/useProgressState";
import { useProgressFetch } from "./progress/useProgressFetch";
import { useProgressRefresh } from "./progress/useProgressRefresh";
import { useProgressUpdate } from "./progress/useProgressUpdate";
import { toast } from "sonner";

export const useProgress = () => {
  const { user } = useAuth();
  const {
    progress,
    setProgress,
    isLoading,
    setIsLoading,
    hasInitialized,
    progressId,
    isMounted,
    lastUpdateTime,
    lastError,
    retryCount,
    toastShownRef,
    logDebugEvent
  } = useProgressState();

  const { fetchProgress } = useProgressFetch(
    isMounted,
    setProgress,
    setIsLoading,
    progressId,
    lastError,
    retryCount,
    logDebugEvent
  );

  const { refreshProgress } = useProgressRefresh(
    progressId,
    setIsLoading,
    lastError,
    isMounted,
    setProgress,
    retryCount,
    fetchProgress,
    logDebugEvent
  );

  const { updateProgress } = useProgressUpdate(
    progress,
    setProgress,
    toastShownRef,
    lastError,
    refreshProgress,
    logDebugEvent
  );

  // Inicialização lenta dos dados para evitar loops de renderização
  useEffect(() => {
    if (!hasInitialized.current && user) {
      console.log("[DEBUG] Inicializando hook de progresso para usuário:", user.id);
      logDebugEvent("useProgress_init", { userId: user.id });
      hasInitialized.current = true;
      
      const initialize = async () => {
        try {
          logDebugEvent("useProgress_fetch_start");
          await fetchProgress();
          logDebugEvent("useProgress_fetch_complete");
        } catch (error) {
          console.error("[ERRO] Falha ao inicializar dados de progresso:", error);
          logDebugEvent("useProgress_fetch_error", { error: String(error) });
          
          if (isMounted.current) {
            toast.error("Erro ao carregar seus dados de progresso");
          }
        }
      };
      
      initialize();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [user, fetchProgress]);

  // Função auxiliar para lidar com erros consistentemente
  const attemptDataLoad = async (callback: () => void) => {
    if (!user) {
      console.error("Tentativa de carregar dados sem usuário");
      return;
    }
    
    try {
      callback();
    } catch (error) {
      console.error("Erro ao executar callback de carregamento:", error);
      lastError.current = error instanceof Error ? error : new Error(String(error));
    }
  };

  const [loadingAttempts, setLoadingAttempts] = useState(0);
  
  return {
    progress,
    isLoading,
    lastError: lastError.current,
    lastUpdateTime: lastUpdateTime.current,
    refreshProgress,
    updateProgress,
    loadError: lastError.current,
    progressLoading: isLoading,
    loadingAttempts,
    setLoadingAttempts,
    attemptDataLoad
  };
};

// Adicionar importação de useState
import { useState } from "react";
