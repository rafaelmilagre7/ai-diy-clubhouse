
import { useState, useEffect, useCallback, useRef } from "react";
import { OnboardingProgress } from "@/types/onboarding";
import { useProgressFetch } from "./progress/useProgressFetch";
import { updateOnboardingProgress } from "./persistence/progressPersistence";
import { useAuth } from "@/contexts/auth";
import { useLogging } from "../useLogging";
import { toast } from "sonner";
import { isDevelopmentMode } from "@/lib/supabase/client";

// Constantes para configuração
const MAX_RETRY_COUNT = 3;
const LOADING_TIMEOUT_MS = 5000;
const MOCK_DATA_ENABLED = true;

/**
 * Hook principal para acessar e manipular o progresso do onboarding
 */
export function useProgress() {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const isMounted = useRef(true);
  const progressId = useRef<string | null>(null);
  const lastError = useRef<Error | null>(null);
  const retryCount = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { user } = useAuth();
  const { logError, log } = useLogging();

  // Modo de desenvolvimento detectado
  const devMode = isDevelopmentMode();

  // Função para registrar eventos de debug
  const logDebugEvent = useCallback((eventName: string, data?: any) => {
    log(`progress_${eventName}`, data || {});
    console.log(`[Onboarding Debug] ${eventName}`, data || {});
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
   * Função para criar dados mockados de progresso para desenvolvimento
   */
  const createMockProgressData = useCallback((): OnboardingProgress => {
    const mockId = `mock-${Date.now()}`;
    logDebugEvent("creating_mock_data", { id: mockId });
    
    return {
      id: mockId,
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
      sync_status: "offline",
      onboarding_type: "club"
    };
  }, [user, logDebugEvent]);

  /**
   * Inicializa o modo offline com dados mockados
   */
  const initializeOfflineMode = useCallback(() => {
    if (isOfflineMode) return; // Já está em modo offline
    
    logDebugEvent("initializing_offline_mode");
    const mockData = createMockProgressData();
    
    setProgress(mockData);
    progressId.current = mockData.id;
    setIsOfflineMode(true);
    setIsLoading(false);
    
    toast.info("Modo offline ativado. Os dados serão armazenados localmente.", {
      description: "Suas alterações não serão sincronizadas com o servidor.",
      duration: 5000
    });
    
    return mockData;
  }, [isOfflineMode, createMockProgressData, logDebugEvent]);

  /**
   * Atualiza o progresso do onboarding com novos dados
   */
  const updateProgress = useCallback(async (data: Partial<OnboardingProgress>) => {
    try {
      // Se estamos em modo offline, apenas atualizar o estado local
      if (isOfflineMode) {
        logDebugEvent("update_progress_offline", { data });
        
        setProgress(prev => {
          if (!prev) return { ...data } as OnboardingProgress;
          return { ...prev, ...data };
        });
        
        return { 
          success: true, 
          data: { ...progress, ...data },
          offline: true
        };
      }

      // Para fluxo online: verificar se temos ID de progresso
      if (!progressId.current) {
        logDebugEvent("no_progress_id", { retryCount: retryCount.current });
        
        // Limitar tentativas de busca/criação
        if (retryCount.current >= MAX_RETRY_COUNT) {
          logDebugEvent("max_retries_reached", { switching_to_offline: true });
          return initializeOfflineMode();
        }
        
        // Tentar buscar/criar progresso
        const result = await fetchProgress();
        
        // Se ainda sem ID após a tentativa, ir para modo offline
        if (!progressId.current) {
          logDebugEvent("failed_to_get_progress_id");
          return initializeOfflineMode();
        }
        
        // Se obtivemos dados, continuar com a atualização
        if (result) {
          logDebugEvent("progress_fetched_successfully", { id: progressId.current });
        }
      }

      logDebugEvent("updating_progress", {
        id: progressId.current,
        data
      });
      
      // Apenas se temos um ID válido e não estamos em modo mock, atualizar no banco
      if (progressId.current && !progressId.current.startsWith('mock-')) {
        const { data: updatedData, error } = await updateOnboardingProgress(
          progressId.current, 
          data
        );

        if (error) {
          logError("update_progress_error", { error: error.message });
          logDebugEvent("update_error", { error: error.message });
          
          // Em caso de erro, atualizar apenas localmente
          setProgress(prev => {
            if (!prev) return { ...data } as OnboardingProgress;
            return { ...prev, ...data };
          });
          
          return { 
            success: true, 
            data: { ...progress, ...data },
            offline: true,
            error
          };
        }

        // Atualizar estado local com dados do servidor
        if (updatedData) {
          setProgress(updatedData);
          logDebugEvent("update_success", { id: updatedData.id });
          return { success: true, data: updatedData };
        }
      }
      
      // Fallback: atualizar apenas com os dados enviados
      setProgress(prev => {
        if (!prev) return { ...data } as OnboardingProgress;
        return { ...prev, ...data };
      });

      log("progress_updated", { success: true });
      return { success: true, data: { ...progress, ...data } };
      
    } catch (error: any) {
      console.error("[useProgress] Erro ao atualizar progresso:", error);
      logError("update_progress_error", { error: String(error) });
      logDebugEvent("update_exception", { error: String(error) });
      
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
  }, [progress, log, logError, fetchProgress, isOfflineMode, logDebugEvent, initializeOfflineMode]);

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
        logDebugEvent("refresh_skipped_loading");
        return progress;
      }
      
      // Se estamos em modo offline, apenas retornar os dados atuais
      if (isOfflineMode) {
        logDebugEvent("refresh_skipped_offline");
        return progress;
      }
      
      setIsLoading(true);
      logDebugEvent("refresh_started");
      
      // Se não temos usuário ou estamos em modo offline forçado
      if (!user) {
        logDebugEvent("refresh_no_user");
        initializeOfflineMode();
        return progress;
      }
      
      // Adicionar timeout de segurança para evitar loading infinito
      timeoutRef.current = setTimeout(() => {
        if (isLoading && isMounted.current) {
          logDebugEvent("loading_timeout_reached");
          setIsLoading(false);
          
          // Se após tempo limite ainda não temos dados, ir para modo offline
          if (!progress && isMounted.current) {
            initializeOfflineMode();
          }
        }
      }, LOADING_TIMEOUT_MS);
      
      // Tentativa de carregar dados reais
      const result = await fetchProgress();
      
      // Limpar o timeout, pois a operação completou
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Se não conseguimos dados e atingimos o limite de tentativas, ir para modo offline
      if (!result && retryCount.current >= MAX_RETRY_COUNT) {
        logDebugEvent("fetch_failed_switching_offline");
        initializeOfflineMode();
      }
      
      return result || progress;
    } catch (error) {
      console.error("[useProgress] Erro ao atualizar dados:", error);
      logError("refresh_progress_error", {
        error: error instanceof Error ? error.message : String(error)
      });
      logDebugEvent("refresh_exception", { 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      // Garantir que isLoading é sempre definido como false
      setIsLoading(false);
      
      // Em caso de erro, ir para modo offline
      initializeOfflineMode();
      
      return null;
    } finally {
      // Garantir que o loading é finalizado em qualquer cenário
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user, progress, fetchProgress, logError, isOfflineMode, isLoading, logDebugEvent, initializeOfflineMode]);

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
    isOfflineMode,
    refreshProgress,
    updateProgress,
    lastError: lastError.current,
    initializeOfflineMode,
    isDevelopmentMode: devMode
  };
}
