
import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { useProgressState } from "./progress/useProgressState";
import { useProgressFetch } from "./progress/useProgressFetch";
import { useProgressUpdate } from "./progress/useProgressUpdate";
import { useProgressRefresh } from "./progress/useProgressRefresh";
import { toast } from "sonner";
import { OnboardingProgress } from "@/types/onboarding";

export const useProgress = () => {
  const { user } = useAuth();
  const fetchInProgress = useRef(false);
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

  // Versão com debouncing para evitar chamadas múltiplas
  const refreshProgress = useCallback(async (): Promise<OnboardingProgress | null> => {
    if (fetchInProgress.current) {
      console.log("[useProgress] Refresh já em andamento, ignorando nova solicitação");
      return progress;
    }
    
    try {
      fetchInProgress.current = true;
      console.log("[useProgress] Iniciando atualização dos dados de progresso");
      const refreshedProgress = await fetchProgress();
      console.log("[useProgress] Dados de progresso atualizados:", refreshedProgress);
      return refreshedProgress || null;
    } catch (error) {
      console.error("[useProgress] Erro ao atualizar progresso:", error);
      return null;
    } finally {
      // Garantir que o flag seja liberado após um pequeno delay
      // para evitar múltiplas chamadas em sequência rápida
      setTimeout(() => {
        fetchInProgress.current = false;
      }, 300);
    }
  }, [fetchProgress, progress]);

  const { updateProgress } = useProgressUpdate(
    progress,
    setProgress,
    toastShownRef,
    lastError,
    refreshProgress,
    logDebugEvent
  );

  // Função para forçar um reset completo do progresso do usuário
  const resetProgress = async () => {
    try {
      if (!user) {
        console.error("[ERRO] Tentativa de reset sem usuário autenticado");
        return false;
      }
      
      logDebugEvent("resetProgress", { userId: user.id });
      setIsLoading(true);
      
      // Importação dinâmica para evitar dependências circulares
      const { resetOnboardingProgress } = await import('./persistence/progressPersistence');
      
      const { success, data, error } = await resetOnboardingProgress(user.id);
      
      if (!success || error) {
        console.error("[ERRO] Falha ao resetar progresso:", error);
        toast.error("Erro ao limpar dados de progresso. Tente novamente.");
        return false;
      }
      
      // Atualizar estado local
      setProgress(data || null);
      progressId.current = data?.id || null;
      toast.success("Dados de progresso limpos com sucesso!");
      
      return true;
    } catch (error) {
      console.error("[ERRO] Exceção ao resetar progresso:", error);
      toast.error("Erro ao limpar dados. Tente novamente.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Limpar flags de montagem ao desmontar
  useEffect(() => {
    isMounted.current = true;
    toastShownRef.current = false;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Só carregar dados uma vez na montagem
  useEffect(() => {
    if (!user) {
      console.log("[DEBUG] Sem usuário autenticado, não buscando progresso");
      return;
    }
    
    if (hasInitialized.current) {
      console.log("[DEBUG] Progresso já inicializado, ignorando");
      return;
    }
    
    console.log("[DEBUG] Inicializando useProgress, buscando dados para usuário:", user.id);
    fetchProgress();
    hasInitialized.current = true;
  }, [user, fetchProgress]);

  return {
    progress,
    isLoading,
    updateProgress,
    refreshProgress,
    fetchProgress,
    resetProgress,
    lastError: lastError.current,
    isInitialized: hasInitialized.current
  };
};
