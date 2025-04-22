
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useProgressState } from "./progress/useProgressState";
import { useProgressFetch } from "./progress/useProgressFetch";
import { useProgressUpdate } from "./progress/useProgressUpdate";
import { useProgressRefresh } from "./progress/useProgressRefresh";
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
    toastShownRef
  } = useProgressState();

  const { fetchProgress } = useProgressFetch(
    isMounted,
    setProgress,
    setIsLoading,
    progressId,
    lastError,
    retryCount
  );

  const { refreshProgress } = useProgressRefresh(
    progressId,
    setIsLoading,
    lastError,
    isMounted,
    setProgress,
    retryCount,
    fetchProgress
  );

  const { updateProgress } = useProgressUpdate(
    progress,
    setProgress,
    toastShownRef,
    lastError,
    refreshProgress
  );

  // Função para forçar um reset completo do progresso do usuário
  const resetProgress = async () => {
    try {
      if (!user) {
        console.error("[ERRO] Tentativa de reset sem usuário autenticado");
        return false;
      }
      
      console.log("[DEBUG] Iniciando reset completo de progresso para usuário:", user.id);
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

  useEffect(() => {
    isMounted.current = true;
    toastShownRef.current = false;
    return () => {
      isMounted.current = false;
    };
  }, []);

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
