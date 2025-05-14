
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
   * Busca o progresso do onboarding do usuário
   */
  const fetchProgress = useCallback(async (): Promise<OnboardingProgress | null> => {
    if (!user) {
      logDebugEvent("fetchProgress_noUser");
      console.log("[ERRO] Tentando buscar progresso sem usuário autenticado");
      return null;
    }
    
    try {
      setIsLoading(true);
      logDebugEvent("fetchProgress_start", { userId: user.id });
      
      // Passo 1: Tentar buscar progresso existente
      const { data, error } = await fetchOnboardingProgress(user.id);
      
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
        
        const { data: initialData, error: createError } = await createInitialOnboardingProgress(user);
        
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
      
      // Dados encontrados
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
