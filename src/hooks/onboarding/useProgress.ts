
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
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
        console.log("[useProgress] Tentativa de atualizar progresso sem ID, tentando buscar/criar");
        await fetchProgress(); // Tentar buscar/criar progresso
        
        // Verificar novamente se temos ID após tentativa de fetch/create
        if (!progressId.current) {
          console.log("[useProgress] Não foi possível obter ID de progresso, usando fallback local");
          
          // Fallback: criar um progresso local apenas em memória
          const fallbackProgress = {
            id: `local-${Date.now()}`,
            user_id: user?.id || 'anonymous',
            current_step: data.current_step || "personal_info",
            completed_steps: data.completed_steps || [],
            is_completed: data.is_completed || false,
            personal_info: data.personal_info || {},
            professional_info: data.professional_info || {},
            business_context: data.business_context || {},
            business_goals: data.business_goals || {},
            ai_experience: data.ai_experience || {},
            experience_personalization: data.experience_personalization || {},
            complementary_info: data.complementary_info || {},
            sync_status: "local",
            onboarding_type: data.onboarding_type || "club"
          } as OnboardingProgress;
          
          setProgress(fallbackProgress);
          progressId.current = fallbackProgress.id;
          
          toast.warning("Usando modo offline temporariamente. Seus dados serão salvos localmente.");
          
          return { 
            success: true, 
            data: fallbackProgress,
            offline: true
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
        
        // Fallback: atualizar apenas localmente em caso de erro
        setProgress(prev => {
          if (!prev) return { ...data } as OnboardingProgress;
          return { ...prev, ...data };
        });
        
        console.log("[useProgress] Erro ao atualizar no banco, usando dados locais:", error);
        
        return { 
          success: true, 
          data: { ...progress, ...data },
          offline: true,
          error
        };
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
      return { success: true, data: updatedData || { ...progress, ...data } };
      
    } catch (error: any) {
      console.error("[useProgress] Erro ao atualizar progresso:", error);
      logError("update_progress_error", { error: String(error) });
      
      // Fallback: atualizar apenas localmente em caso de erro
      setProgress(prev => {
        if (!prev) return { ...data } as OnboardingProgress;
        return { ...prev, ...data };
      });
      
      return { 
        success: true, 
        data: { ...progress, ...data },
        offline: true,
        error: { 
          message: error instanceof Error ? error.message : String(error)
        } 
      };
    }
  }, [progress, log, logError, fetchProgress, devMode, user]);

  /**
   * Carrega dados atualizados do progresso do onboarding
   * com proteção contra loops infinitos
   */
  const refreshProgress = useCallback(async () => {
    try {
      // Cancelar qualquer timeout pendente
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Evitar múltiplas chamadas simultâneas se já estiver carregando
      if (isLoading) {
        console.log("[useProgress] Já está carregando, ignorando solicitação adicional");
        return progress;
      }
      
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
            timezone: "America/Sao_Paulo" // Horário de Brasília como padrão
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
      
      // Adicionar timeout de segurança para evitar loading infinito
      timeoutRef.current = setTimeout(() => {
        if (isLoading && isMounted.current) {
          console.warn("[useProgress] Tempo limite de carregamento atingido, forçando finalização");
          setIsLoading(false);
          
          // Se após tempo limite ainda não temos dados, criar dados locais temporários
          if (!progress && isMounted.current) {
            const fallbackProgress: OnboardingProgress = {
              id: `local-${Date.now()}`,
              user_id: user?.id || 'anonymous',
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
                timezone: "America/Sao_Paulo" // Horário de Brasília como padrão
              },
              professional_info: {},
              business_context: {},
              business_goals: {},
              ai_experience: {},
              experience_personalization: {},
              complementary_info: {},
              sync_status: "local",
              onboarding_type: "club"
            };
            
            setProgress(fallbackProgress);
            progressId.current = fallbackProgress.id;
          }
        }
      }, 5000); // 5 segundos de timeout máximo
      
      const result = await fetchProgress();
      
      // Limpar o timeout, pois a operação completou
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      return result;
    } catch (error) {
      console.error("[useProgress] Erro ao atualizar dados:", error);
      logError("refresh_progress_error", {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Garantir que isLoading é sempre definido como false
      setIsLoading(false);
      
      return null;
    } finally {
      // Garantir que o loading é finalizado em qualquer cenário
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user, progress, fetchProgress, logError, devMode, isLoading]);

  // Efeito para limpar referências ao desmontar
  useEffect(() => {
    return () => {
      isMounted.current = false;
      
      // Limpar timeout ao desmontar
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
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
