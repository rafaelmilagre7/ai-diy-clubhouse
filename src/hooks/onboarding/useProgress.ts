
import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { useProgressState } from "./progress/useProgressState";
import { useProgressFetch } from "./progress/useProgressFetch";
import { useProgressUpdate } from "./progress/useProgressUpdate";
import { toast } from "sonner";
import { OnboardingProgress } from "@/types/onboarding";

// Constantes para controle de tempo
const FETCH_TIMEOUT = 10000; // 10 segundos para timeout da requisição
const FETCH_DEBOUNCE = 500; // 500ms para debouncing de chamadas múltiplas

export const useProgress = () => {
  const { user } = useAuth();
  const fetchInProgress = useRef(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // Função para garantir que o fetchInProgress seja resetado
  const safeResetFetchInProgress = useCallback(() => {
    try {
      fetchInProgress.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    } catch (error) {
      console.error("[useProgress] Erro ao resetar estado de fetch:", error);
    }
  }, []);

  // Versão com debouncing para evitar chamadas múltiplas
  const refreshProgress = useCallback(async (): Promise<OnboardingProgress | null> => {
    // Verificar se já está em andamento
    if (fetchInProgress.current) {
      console.log("[useProgress] Refresh já em andamento, ignorando nova solicitação");
      return progress;
    }
    
    try {
      fetchInProgress.current = true;
      
      // Definir timeout de segurança para liberar flag em caso de erro
      fetchTimeoutRef.current = setTimeout(() => {
        console.log("[useProgress] Timeout de fetch atingido, resetando estado");
        safeResetFetchInProgress();
      }, FETCH_TIMEOUT);
      
      logDebugEvent("refreshProgress_started", { userId: user?.id });
      const refreshedProgress = await fetchProgress();
      
      // Liberar flag após conclusão bem-sucedida
      safeResetFetchInProgress();
      
      return refreshedProgress || null;
    } catch (error) {
      console.error("[useProgress] Erro ao atualizar progresso:", error);
      logDebugEvent("refreshProgress_error", { error: String(error) });
      toast.error("Erro ao atualizar seus dados. Tente novamente.");
      
      // Liberar flag após erro
      safeResetFetchInProgress();
      return null;
    }
  }, [fetchProgress, progress, user?.id, safeResetFetchInProgress, logDebugEvent]);

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
      safeResetFetchInProgress();
    };
  }, [safeResetFetchInProgress]);

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
    lastError: lastError.current
  };
};
