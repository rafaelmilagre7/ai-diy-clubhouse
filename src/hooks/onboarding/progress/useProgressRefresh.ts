
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
  fetchProgress: () => Promise<any>
) {
  const { user } = useAuth();

  const refreshProgress = useCallback(async () => {
    if (!user) return null;

    if (!progressId.current) {
      console.log("ID de progresso não disponível, buscando dados iniciais");
      return await fetchProgress();
    }

    try {
      setIsLoading(true);
      lastError.current = null;
      console.log("Atualizando dados do progresso:", progressId.current);
      
      const { data, error } = await refreshOnboardingProgress(progressId.current);

      if (!isMounted.current) return null;

      if (error) {
        console.error("Erro ao recarregar progresso:", error);
        lastError.current = new Error(error.message);
        
        if (retryCount.current < 3) {
          retryCount.current++;
          console.log(`Tentando novamente (${retryCount.current}/3) em ${retryCount.current * 1000}ms...`);
          setTimeout(() => {
            refreshProgress();
          }, retryCount.current * 1000);
        }
        
        return null;
      }

      console.log("Progresso recarregado com sucesso:", data);
      setProgress(data);
      retryCount.current = 0;
      return data;
    } catch (error) {
      console.error("Erro ao recarregar progresso:", error);
      lastError.current = error instanceof Error ? error : new Error(String(error));
      return null;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user, progressId, setIsLoading, lastError, isMounted, setProgress, retryCount, fetchProgress]);

  return { refreshProgress };
}
