
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
    if (!user) return null;

    try {
      setIsLoading(true);
      lastError.current = null;
      console.log("Buscando progresso para o usuário:", user.id);

      const { data, error } = await fetchOnboardingProgress(user.id);

      if (!isMounted.current) return null;

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes("Results contain 0 rows")) {
          console.log("Não há progresso existente, criando novo registro");
          const { data: newData, error: createError } = await createInitialOnboardingProgress(user);
          if (!createError && newData) {
            setProgress(newData);
            progressId.current = newData.id;
            console.log("Novo progresso criado:", newData);
          } else {
            console.error("Erro ao criar novo progresso:", createError);
            lastError.current = new Error(createError?.message || "Erro ao criar progresso");
          }
          return newData;
        }
        console.error("Erro ao carregar progresso:", error);
        lastError.current = new Error(error.message);
        return null;
      }

      if (!data) {
        console.log("Nenhum progresso encontrado, criando novo registro");
        const { data: newData, error: createError } = await createInitialOnboardingProgress(user);
        if (!createError && newData) {
          setProgress(newData);
          progressId.current = newData.id;
          console.log("Novo progresso criado:", newData);
        } else {
          console.error("Erro ao criar novo progresso:", createError);
          lastError.current = new Error(createError?.message || "Erro ao criar progresso");
        }
        return newData;
      }

      console.log("Progresso carregado com sucesso:", data);
      setProgress(data);
      progressId.current = data.id;
      retryCount.current = 0;
      return data;
    } catch (error: any) {
      console.error("Erro ao carregar progresso:", error);
      lastError.current = error;
      return null;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user, setProgress, setIsLoading, isMounted, progressId, lastError, retryCount]);

  return { fetchProgress };
}
