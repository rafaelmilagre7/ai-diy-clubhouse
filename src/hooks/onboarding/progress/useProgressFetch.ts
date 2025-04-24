
import { useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { fetchOnboardingProgress, createInitialOnboardingProgress } from "../persistence/progressPersistence";

export function useProgressFetch(
  isMounted: React.MutableRefObject<boolean>,
  setProgress: (progress: any) => void,
  setIsLoading: (loading: boolean) => void,
  progressId: React.MutableRefObject<string | null>,
  lastError: React.MutableRefObject<Error | null>,
  retryCount: React.MutableRefObject<number>,
  logDebugEvent: (action: string, data?: any) => void
) {
  const { user } = useAuth();

  const fetchProgress = useCallback(async () => {
    if (!user) {
      console.warn("[DEBUG] Tentativa de buscar progresso sem usuário autenticado");
      return null;
    }

    try {
      setIsLoading(true);
      logDebugEvent("fetchProgress_start", { userId: user.id });
      console.log("[DEBUG] Buscando progresso para o usuário:", user.id);
      
      const { data, error } = await fetchOnboardingProgress(user.id);

      if (!isMounted.current) return null;

      if (error) {
        console.error("[ERRO] Erro ao buscar progresso:", error);
        lastError.current = error;
        logDebugEvent("fetchProgress_error", { error: error.message });
        return null;
      }

      if (!data) {
        console.log("[DEBUG] Nenhum progresso encontrado. Criando progresso inicial...");
        logDebugEvent("createInitialProgress_start", { userId: user.id });
        
        const { data: newData, error: newError } = await createInitialOnboardingProgress(user);

        if (!isMounted.current) return null;

        if (newError) {
          console.error("[ERRO] Erro ao criar progresso inicial:", newError);
          lastError.current = newError;
          logDebugEvent("createInitialProgress_error", { error: newError.message });
          return null;
        }

        logDebugEvent("createInitialProgress_success", { progressId: newData?.id });
        console.log("[DEBUG] Novo progresso criado com sucesso:", newData);
        progressId.current = newData?.id || null;
        setProgress(newData);
        return newData;
      }

      logDebugEvent("fetchProgress_success", { progressId: data.id });
      console.log("[DEBUG] Progresso encontrado:", data);
      progressId.current = data.id;
      setProgress(data);
      return data;
    } catch (error) {
      if (!isMounted.current) return null;
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      logDebugEvent("fetchProgress_exception", { error: errorMessage });
      console.error("[ERRO] Erro ao buscar ou criar progresso:", error);
      lastError.current = error instanceof Error ? error : new Error(String(error));
      return null;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user, setProgress, setIsLoading, isMounted, progressId, lastError, retryCount, logDebugEvent]);

  return { fetchProgress };
}
