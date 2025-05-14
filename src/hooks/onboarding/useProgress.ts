
import { useState, useEffect, useCallback, useRef } from "react";
import { OnboardingProgress } from "@/types/onboarding";
import { useProgressFetch } from "./progress/useProgressFetch";
import { updateOnboardingProgress } from "./persistence/progressPersistence";
import { useAuth } from "@/contexts/auth";
import { useLogging } from "../useLogging";
import { toast } from "sonner";
import { isDevelopmentMode } from "@/utils/validationUtils";

/**
 * Hook principal para acessar e manipular o progresso do onboarding
 */
export function useProgress() {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);
  const progressId = useRef<string | null>(null);
  const lastError = useRef<Error | null>(null);
  const retryCount = useRef(0);
  
  const { user } = useAuth();
  const { logError, log } = useLogging();

  // Flag para modo de desenvolvimento
  const devMode = isDevelopmentMode();

  // Função para registrar eventos de debug
  const logDebugEvent = useCallback((eventName: string, data?: any) => {
    log(`progress_${eventName}`, data || {});
  }, [log]);

  // Usar hook de busca de progresso
  const { fetchProgress } = useProgressFetch(
    isMounted,
    setProgress,
    setIsLoading,
    progressId,
    lastError,
    retryCount,
    logDebugEvent
  );

  /**
   * Atualiza o progresso do onboarding com novos dados
   */
  const updateProgress = useCallback(async (data: Partial<OnboardingProgress>) => {
    try {
      // Se estamos em modo de desenvolvimento e não temos ID de progresso
      // retornar dados simulados para testes
      if (devMode && !progressId.current) {
        console.log("[useProgress] Modo de desenvolvimento detectado sem progressId, retornando simulação");
        
        // Atualizar estado local imediatamente para fins de desenvolvimento
        setProgress(prev => {
          if (!prev) return { ...data } as OnboardingProgress;
          return { ...prev, ...data };
        });
        
        return { 
          success: true, 
          data: { ...progress, ...data } 
        };
      }

      // Para fluxo real: verificar se temos ID de progresso
      if (!progressId.current) {
        console.error("[useProgress] Tentativa de atualizar progresso sem ID");
        await fetchProgress(); // Tentar buscar/criar progresso
        
        if (!progressId.current) {
          return { 
            error: { 
              message: "Não foi possível encontrar ou criar registro de progresso." 
            } 
          };
        }
      }

      console.log("[useProgress] Atualizando progresso:", {
        id: progressId.current,
        data
      });
      
      // Atualizar no banco de dados
      const { data: updatedData, error } = await updateOnboardingProgress(
        progressId.current as string, 
        data
      );

      if (error) {
        logError("update_progress_error", { error: error.message });
        return { error };
      }

      // Atualizar estado local
      if (updatedData) {
        setProgress(updatedData);
      } else {
        // Fallback: atualizar apenas com os dados enviados
        setProgress(prev => {
          if (!prev) return { ...data } as OnboardingProgress;
          return { ...prev, ...data };
        });
      }

      log("progress_updated", { success: true });
      return { success: true, data: updatedData };
      
    } catch (error: any) {
      console.error("[useProgress] Erro ao atualizar progresso:", error);
      logError("update_progress_error", { error: String(error) });
      
      return { 
        error: { 
          message: error instanceof Error ? error.message : String(error)
        } 
      };
    }
  }, [progress, log, logError, fetchProgress, devMode]);

  /**
   * Carrega dados atualizados do progresso do onboarding
   */
  const refreshProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("[useProgress] Atualizando dados de progresso do onboarding");
      
      // Se não temos usuário ou em modo de desenvolvimento com progressId já definido, usar dados mockados
      if (!user || (devMode && progressId.current)) {
        console.log("[useProgress] Usando dados simulados para testes");
        
        // Simular um pequeno atraso
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Se já temos dados, manter e apenas atualizar flag de carregamento
        if (progress) {
          setIsLoading(false);
          return progress;
        }
        
        // Caso contrário, usar dados simulados
        const mockProgress: OnboardingProgress = {
          id: "onb-mock",
          user_id: "user-mock",
          current_step: "personal_info",
          completed_steps: [],
          is_completed: false,
          personal_info: {
            name: user?.user_metadata?.name || "",
            email: user?.email || "",
            phone: "",
            ddi: "+55",
            country: "Brasil",
            state: "",
            city: "",
            timezone: "America/Sao_Paulo"
          },
          professional_info: {},
          business_context: {},
          business_goals: {},
          ai_experience: {},
          experience_personalization: {},
          complementary_info: {},
          sync_status: "completed",
          onboarding_type: "club"
        };
        
        setProgress(mockProgress);
        setIsLoading(false);
        return mockProgress;
      }
      
      const result = await fetchProgress();
      setIsLoading(false);
      
      return result;
    } catch (error) {
      console.error("[useProgress] Erro ao atualizar dados:", error);
      logError("refresh_progress_error", {
        error: error instanceof Error ? error.message : String(error)
      });
      setIsLoading(false);
      return null;
    }
  }, [user, progress, fetchProgress, logError, devMode]);

  // Efeito para limpar referências ao desmontar
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Carregar dados iniciais ao montar o componente
  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  return {
    progress,
    isLoading,
    refreshProgress,
    updateProgress,
    lastError: lastError.current,
    isDevelopmentMode: devMode
  };
}
