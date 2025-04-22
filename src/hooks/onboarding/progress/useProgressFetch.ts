
import { useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { fetchOnboardingProgress, createInitialOnboardingProgress } from "../persistence/progressPersistence";

export function useProgressFetch(
  isMounted: React.MutableRefObject<boolean>,
  setProgress: (progress: any) => void,
  setIsLoading: (loading: boolean) => void,
  progressId: React.MutableRefObject<string | null>,
  lastError: React.MutableRefObject<Error | null>,
  retryCount: React.MutableRefObject<number>
) {
  const { user } = useAuth();

  const fetchProgress = useCallback(async () => {
    if (!user) {
      console.warn("Tentativa de buscar progresso sem usuário autenticado");
      return null;
    }

    try {
      setIsLoading(true);
      console.log("Buscando progresso para o usuário:", user.id);
      
      const { data, error } = await fetchOnboardingProgress(user.id);

      if (!isMounted.current) return null;

      if (error) {
        console.error("Erro ao buscar progresso:", error);
        lastError.current = error;
        return null;
      }

      if (!data) {
        console.log("Nenhum progresso encontrado. Criando progresso inicial...");
        const { data: newData, error: newError } = await createInitialOnboardingProgress(user);

        if (!isMounted.current) return null;

        if (newError) {
          console.error("Erro ao criar progresso inicial:", newError);
          lastError.current = newError;
          return null;
        }

        console.log("Novo progresso criado com sucesso:", newData);
        progressId.current = newData?.id || null;
        setProgress(newData);
        return newData;
      }

      console.log("Progresso encontrado:", data);
      progressId.current = data.id;
      setProgress(data);
      return data;
    } catch (error) {
      if (!isMounted.current) return null;
      
      console.error("Erro ao buscar ou criar progresso:", error);
      lastError.current = error instanceof Error ? error : new Error(String(error));
      return null;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user, setProgress, setIsLoading, isMounted, progressId, lastError, retryCount]);

  return { fetchProgress };
}
