
import { useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { refreshOnboardingProgress } from "../persistence/progressPersistence";

export function useProgressRefresh(
  progressId: React.MutableRefObject<string | null>,
  setIsLoading: (loading: boolean) => void,
  lastError: React.MutableRefObject<Error | null>,
  isMounted: React.MutableRefObject<boolean>,
  setProgress: (progress: any) => void,
  retryCount: React.MutableRefObject<number>,
  fetchProgress: () => Promise<any>,
  logDebugEvent: (action: string, data?: any) => void
) {
  const { user } = useAuth();

  const refreshProgress = useCallback(async () => {
    if (!user) return null;

    if (!progressId.current) {
      logDebugEvent("refreshProgress_redirect_to_fetch", {});
      console.log("[useProgressRefresh] ID de progresso não disponível, buscando dados iniciais");
      return await fetchProgress();
    }

    try {
      setIsLoading(true);
      lastError.current = null;
      logDebugEvent("refreshProgress_start", { progressId: progressId.current });
      console.log("[useProgressRefresh] Atualizando dados do progresso:", progressId.current);
      
      const { data, error } = await refreshOnboardingProgress(progressId.current);

      if (!isMounted.current) return null;

      if (error) {
        console.error("[useProgressRefresh] Erro ao recarregar progresso:", error);
        lastError.current = new Error(error.message);
        logDebugEvent("refreshProgress_error", { error: error.message });
        
        if (retryCount.current < 3) {
          retryCount.current++;
          console.log(`[useProgressRefresh] Tentando novamente (${retryCount.current}/3) em ${retryCount.current * 1000}ms...`);
          setTimeout(() => {
            refreshProgress();
          }, retryCount.current * 1000);
        }
        
        return null;
      }

      logDebugEvent("refreshProgress_success", { progressId: data?.id });
      console.log("[useProgressRefresh] Progresso recarregado com sucesso:", data);
      
      // Garantir que os dados não são nulos
      if (data) {
        // Normalizar dados antes de atualizar estado
        const normalizedData = data;
        
        // Atualizar o estado com os dados normalizados
        setProgress(normalizedData);
        retryCount.current = 0;
        return normalizedData;
      } else {
        console.warn("[useProgressRefresh] Dados recarregados são nulos ou vazios");
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logDebugEvent("refreshProgress_exception", { error: errorMessage });
      console.error("[useProgressRefresh] Erro ao recarregar progresso:", error);
      lastError.current = error instanceof Error ? error : new Error(String(error));
      return null;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user, progressId, setIsLoading, lastError, isMounted, setProgress, retryCount, fetchProgress, logDebugEvent]);

  return { refreshProgress };
}
