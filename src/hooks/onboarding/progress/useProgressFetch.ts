
import { Dispatch, MutableRefObject, SetStateAction, useCallback } from "react";
import { OnboardingProgress } from "@/types/onboarding";
import { fetchOnboardingProgress, createInitialOnboardingProgress } from "../persistence/progressPersistence";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

// Timeout para a requisição
const FETCH_REQUEST_TIMEOUT = 8000; // Reduzido para 8 segundos

// Função para criar promise com timeout
const withTimeout = (promise: Promise<any>, timeoutMs: number, errorMessage: string) => {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
  
  return Promise.race([
    promise,
    timeoutPromise
  ]).then(result => {
    clearTimeout(timeoutHandle);
    return result;
  }).catch(error => {
    clearTimeout(timeoutHandle);
    throw error;
  });
};

export const useProgressFetch = (
  isMounted: MutableRefObject<boolean>,
  setProgress: Dispatch<SetStateAction<OnboardingProgress | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  progressId: MutableRefObject<string | null>,
  lastError: MutableRefObject<Error | null>,
  retryCount: MutableRefObject<number>,
  logDebugEvent: (eventName: string, data?: any) => void
) => {
  const { user } = useAuth();
  
  /**
   * Busca o progresso do onboarding do usuário com timeout e tratamento robusto de erros
   */
  const fetchProgress = useCallback(async (): Promise<OnboardingProgress | null> => {
    if (!user) {
      logDebugEvent("fetchProgress_noUser");
      console.log("[ERRO] Tentando buscar progresso sem usuário autenticado");
      return null;
    }
    
    // Se já temos um ID de progresso e estamos apenas atualizando, buscar diretamente por ID
    if (progressId.current) {
      logDebugEvent("fetchProgress_refreshingExisting", { progressId: progressId.current });
      try {
        setIsLoading(true);
        const { refreshOnboardingProgress } = await import('../persistence/progressPersistence');
        const { data, error } = await refreshOnboardingProgress(progressId.current);
        
        if (!isMounted.current) return null;
        
        if (error || !data) {
          console.log("[WARN] Erro ao atualizar progresso existente, buscando novamente:", error);
          // Se falhar, limpar o ID e buscar do zero
          progressId.current = null;
        } else {
          setProgress(data);
          lastError.current = null;
          retryCount.current = 0;
          return data;
        }
      } catch (e) {
        console.log("[WARN] Exceção ao atualizar progresso, tentando busca completa:", e);
        progressId.current = null;
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    }
    
    try {
      setIsLoading(true);
      logDebugEvent("fetchProgress_start", { userId: user.id });
      
      // Passo 1: Tentar buscar progresso existente com timeout
      const fetchPromise = fetchOnboardingProgress(user.id);
      const { data, error } = await withTimeout(
        fetchPromise,
        FETCH_REQUEST_TIMEOUT,
        "Tempo limite excedido ao buscar progresso"
      );
      
      if (!isMounted.current) {
        logDebugEvent("fetchProgress_unmountedDuringFetch");
        return null;
      }
      
      if (error) {
        logDebugEvent("fetchProgress_error", { error: error.message });
        console.error("[ERRO] Falha ao buscar progresso:", error);
        lastError.current = error;
        
        // Exibir toast apenas no primeiro erro
        if (retryCount.current === 0) {
          toast.error("Erro ao carregar seus dados. Tentando novamente...");
        }
        
        retryCount.current += 1;
        return null;
      }
      
      // Se não tem dados, criar um registro inicial
      if (!data) {
        logDebugEvent("fetchProgress_creating", { userId: user.id });
        console.log("[DEBUG] Progresso não encontrado, criando...");
        
        const createPromise = createInitialOnboardingProgress(user);
        const { data: initialData, error: createError } = await withTimeout(
          createPromise,
          FETCH_REQUEST_TIMEOUT,
          "Tempo limite excedido ao criar progresso inicial"
        );
        
        if (!isMounted.current) return null;
        
        if (createError) {
          logDebugEvent("fetchProgress_createError", { error: createError.message });
          console.error("[ERRO] Falha ao criar progresso inicial:", createError);
          lastError.current = createError;
          toast.error("Erro ao configurar seu perfil. Por favor, tente novamente.");
          return null;
        }
        
        if (initialData) {
          logDebugEvent("fetchProgress_created", { progressId: initialData.id });
          console.log("[DEBUG] Progresso inicial criado:", initialData);
          progressId.current = initialData.id;
          setProgress(initialData);
          return initialData;
        }
        
        return null;
      }
      
      // Verificar se os dados têm a estrutura esperada
      if (!data.id || !data.user_id) {
        logDebugEvent("fetchProgress_invalidData", { data });
        console.error("[ERRO] Dados de progresso inválidos:", data);
        lastError.current = new Error("Dados de progresso inválidos");
        return null;
      }
      
      // Dados encontrados e válidos
      logDebugEvent("fetchProgress_success", { 
        progressId: data.id,
        currentStep: data.current_step,
        isCompleted: data.is_completed
      });
      
      console.log("[DEBUG] Progresso carregado:", data);
      progressId.current = data.id;
      setProgress(data);
      lastError.current = null;
      retryCount.current = 0;
      
      return data;
    } catch (e: any) {
      logDebugEvent("fetchProgress_exception", { error: e.message });
      console.error("[ERRO] Exceção ao buscar progresso:", e);
      lastError.current = e;
      
      // Exibir toast apenas no primeiro erro
      if (retryCount.current === 0) {
        toast.error("Erro ao carregar seus dados. Por favor, tente novamente.");
      }
      
      retryCount.current += 1;
      return null;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user, setIsLoading, setProgress, isMounted, retryCount, lastError, progressId, logDebugEvent]);

  return { fetchProgress };
};
