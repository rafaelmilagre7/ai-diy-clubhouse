
import { MutableRefObject, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { OnboardingProgress } from "@/types/onboarding";
import { fetchOnboardingProgress, createInitialOnboardingProgress } from "../persistence/progressPersistence";

export function useProgressFetch(
  isMounted: MutableRefObject<boolean>,
  setProgress: (progress: OnboardingProgress | null) => void,
  setIsLoading: (loading: boolean) => void,
  progressId: MutableRefObject<string | null>,
  lastError: MutableRefObject<Error | null>,
  retryCount: MutableRefObject<number>,
  logDebugEvent: (action: string, data?: any) => void
) {
  const { user } = useAuth();
  
  const fetchProgress = useCallback(async (): Promise<OnboardingProgress | null> => {
    if (!user) {
      console.log("Usuário não autenticado, não buscando progresso");
      return null;
    }
    
    if (!isMounted.current) {
      console.log("Componente desmontado, cancelando busca de progresso");
      return null;
    }
    
    setIsLoading(true);
    logDebugEvent("fetchProgress", { userId: user?.id });
    
    try {
      // Buscar progresso existente
      const { data, error } = await fetchOnboardingProgress(user.id);
      
      // Verificar se houve erro na busca
      if (error) {
        console.error("Erro ao buscar progresso:", error);
        lastError.current = error instanceof Error ? error : new Error(String(error));
        return null;
      }
      
      // Verificar se dados foram encontrados
      if (data) {
        if (!isMounted.current) {
          return null;
        }
        
        console.log("Progresso encontrado:", data);
        progressId.current = data.id;
        setProgress(data);
        retryCount.current = 0;
        return data;
      }
      
      // Se não encontrou dados, cria um perfil inicial
      console.log("Nenhum progresso encontrado, criando inicial");
      const { data: newData, error: createError } = await createInitialOnboardingProgress(user);
      
      if (createError) {
        console.error("Erro ao criar progresso inicial:", createError);
        lastError.current = createError instanceof Error ? createError : new Error(String(createError));
        return null;
      }
      
      if (!isMounted.current) {
        return null;
      }
      
      if (newData) {
        console.log("Novo progresso criado:", newData);
        progressId.current = newData.id;
        setProgress(newData);
        retryCount.current = 0;
        return newData;
      }
      
    } catch (error) {
      console.error("Exceção ao buscar progresso:", error);
      lastError.current = error instanceof Error ? error : new Error(String(error));
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
    
    return null;
  }, [user, isMounted, setProgress, setIsLoading, progressId, lastError, retryCount, logDebugEvent]);
  
  return { fetchProgress };
}
