
import { Dispatch, MutableRefObject, SetStateAction, useCallback } from "react";
import { OnboardingProgress } from "@/types/onboarding";
import { fetchOnboardingProgress, createInitialOnboardingProgress } from "../persistence/progressPersistence";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

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
   * Busca o progresso do onboarding do usuário com retry limitado e seguro
   */
  const fetchProgress = useCallback(async (): Promise<OnboardingProgress | null> => {
    if (!user) {
      logDebugEvent("fetchProgress_noUser");
      console.log("[ERRO] Tentando buscar progresso sem usuário autenticado");
      setIsLoading(false);
      return null;
    }
    
    // Garantir que não estamos em um loop infinito
    if (retryCount.current > 3) {
      logDebugEvent("fetchProgress_tooManyRetries", { retries: retryCount.current });
      console.warn("[AVISO] Muitas tentativas de buscar progresso, interrompendo.");
      if (isMounted.current) {
        setIsLoading(false);
      }
      return null;
    }
    
    try {
      setIsLoading(true);
      logDebugEvent("fetchProgress_start", { userId: user.id, attempt: retryCount.current + 1 });
      
      // Passo 1: Tentar buscar progresso existente
      const { data, error } = await fetchOnboardingProgress(user.id);
      
      // Verificação crítica: se componente desmontado, abortar operação
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
        
        // Incrementar contagem de tentativas
        retryCount.current += 1;
        
        // Garantir que isLoading é definido para false
        if (isMounted.current) {
          setIsLoading(false);
        }
        return null;
      }
      
      // Se não tem dados, criar um registro inicial
      if (!data) {
        logDebugEvent("fetchProgress_creating", { userId: user.id });
        console.log("[DEBUG] Progresso não encontrado, criando...");
        
        const { data: initialData, error: createError } = await createInitialOnboardingProgress(user);
        
        // Verificação crítica: se componente desmontado, abortar operação
        if (!isMounted.current) return null;
        
        if (createError) {
          logDebugEvent("fetchProgress_createError", { error: createError.message });
          console.error("[ERRO] Falha ao criar progresso inicial:", createError);
          lastError.current = createError;
          toast.error("Erro ao configurar seu perfil. Por favor, tente novamente.");
          
          // Garantir que isLoading é definido para false
          if (isMounted.current) {
            setIsLoading(false);
          }
          return null;
        }
        
        if (initialData) {
          logDebugEvent("fetchProgress_created", { progressId: initialData.id });
          console.log("[DEBUG] Progresso inicial criado:", initialData);
          progressId.current = initialData.id;
          
          // Atualizar estado apenas se o componente ainda estiver montado
          if (isMounted.current) {
            setProgress(initialData);
            setIsLoading(false);
          }
          
          return initialData;
        }
        
        // Garantir que isLoading é definido para false no caso de falha
        if (isMounted.current) {
          setIsLoading(false);
        }
        return null;
      }
      
      // Dados encontrados
      logDebugEvent("fetchProgress_success", { 
        progressId: data.id,
        currentStep: data.current_step,
        isCompleted: data.is_completed
      });
      
      console.log("[DEBUG] Progresso carregado:", data);
      progressId.current = data.id;
      
      // Atualizar estados apenas se componente ainda montado
      if (isMounted.current) {
        setProgress(data);
        setIsLoading(false);
      }
      
      // Resetar contadores de erro
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
      
      // Garantir que isLoading é definido para false mesmo em caso de exceção
      if (isMounted.current) {
        setIsLoading(false);
      }
      
      return null;
    } finally {
      // Belt and suspenders: garantir que isLoading é SEMPRE definido como false
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user, setIsLoading, setProgress, isMounted, retryCount, lastError, progressId, logDebugEvent]);

  return { fetchProgress };
};
