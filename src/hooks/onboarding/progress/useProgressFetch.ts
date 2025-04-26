
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
      lastError.current = new Error("Usuário não autenticado");
      return null;
    }
    
    if (!isMounted.current) {
      console.log("Componente desmontado, cancelando busca de progresso");
      return null;
    }
    
    // Evitar atualizações de loading desnecessárias se já tivermos dados
    // e o componente estiver apenas sendo re-renderizado
    if (progressId.current) {
      console.log(`Já temos ID de progresso (${progressId.current}), não precisamos atualizar loading`);
    } else {
      setIsLoading(true);
    }
    
    logDebugEvent("fetchProgress", { userId: user?.id });
    
    try {
      // Buscar progresso existente
      const { data, error } = await fetchOnboardingProgress(user.id);
      
      // Garantir que o componente ainda está montado após a requisição
      if (!isMounted.current) {
        console.log("Componente desmontado após requisição, cancelando atualização");
        return null;
      }
      
      // Verificar se houve erro na busca
      if (error) {
        console.error("Erro ao buscar progresso:", error);
        lastError.current = error instanceof Error ? error : new Error(String(error));
        setIsLoading(false);
        return null;
      }
      
      // Verificar se dados foram encontrados
      if (data) {
        console.log("Progresso encontrado:", data);
        progressId.current = data.id;
        
        // Adicionar metadata para controle de normalização
        const normalizedData = {
          ...data,
          _metadata: {
            normalized_at: new Date().toISOString(),
            normalized_version: '2.0'
          }
        };
        
        setProgress(normalizedData);
        retryCount.current = 0;
        setIsLoading(false);
        return normalizedData;
      }
      
      // Se não encontrou dados, cria um perfil inicial
      console.log("Nenhum progresso encontrado, criando inicial");
      const { data: newData, error: createError } = await createInitialOnboardingProgress(user);
      
      // Verificar novamente se o componente está montado
      if (!isMounted.current) {
        console.log("Componente desmontado após criar perfil inicial, cancelando atualização");
        return null;
      }
      
      if (createError) {
        console.error("Erro ao criar progresso inicial:", createError);
        lastError.current = createError instanceof Error ? createError : new Error(String(createError));
        setIsLoading(false);
        return null;
      }
      
      if (newData) {
        console.log("Novo progresso criado:", newData);
        progressId.current = newData.id;
        
        // Adicionar metadata para controle de normalização
        const normalizedNewData = {
          ...newData,
          _metadata: {
            normalized_at: new Date().toISOString(),
            normalized_version: '2.0'
          }
        };
        
        setProgress(normalizedNewData);
        retryCount.current = 0;
        setIsLoading(false);
        return normalizedNewData;
      }
      
      setIsLoading(false);
      return null;
    } catch (error) {
      console.error("Exceção ao buscar progresso:", error);
      lastError.current = error instanceof Error ? error : new Error(String(error));
      if (isMounted.current) {
        setIsLoading(false);
      }
      return null;
    }
  }, [user, isMounted, setProgress, setIsLoading, progressId, lastError, retryCount, logDebugEvent]);
  
  return { fetchProgress };
}
