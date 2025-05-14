
import { useRef, useState } from "react";
import { OnboardingProgress } from "@/types/onboarding";

/**
 * Hook que gerencia o estado interno do progresso do onboarding
 */
export function useProgressState() {
  // Estado do progresso atual
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  
  // Estado de carregamento
  const [isLoading, setIsLoading] = useState(true);
  
  // Referências para controle de estado interno que não causam re-renderização
  const hasInitialized = useRef(false);
  const progressId = useRef<string | null>(null);
  const isMounted = useRef(true);
  const lastUpdateTime = useRef<Date | null>(null);
  const lastError = useRef<Error | null>(null);
  const retryCount = useRef(0);
  const toastShownRef = useRef(false);
  
  /**
   * Função para registrar eventos de depuração
   */
  const logDebugEvent = (eventName: string, data?: any) => {
    console.log(`[Onboarding:${eventName}]`, data || {});
    
    // Opcionalmente: enviar eventos para um sistema de analytics
    try {
      // Exemplo de registro em logs de debugs locais no progresso
      if (progress?.debug_logs) {
        const updatedLogs = Array.isArray(progress.debug_logs) ? progress.debug_logs : [];
        updatedLogs.push({
          event: eventName,
          timestamp: new Date().toISOString(),
          data: data || {}
        });
        
        // Limitar a 50 últimos logs para não sobrecarregar
        while (updatedLogs.length > 50) {
          updatedLogs.shift();
        }
        
        // Isso não causa re-renderização, apenas atualiza o objeto de progresso interno
        if (progress) {
          progress.debug_logs = updatedLogs;
        }
      }
    } catch (e) {
      // Ignora erros de logging
    }
  };

  return {
    // Estado
    progress,
    setProgress,
    isLoading,
    setIsLoading,
    
    // Refs
    hasInitialized,
    progressId,
    isMounted,
    lastUpdateTime,
    lastError,
    retryCount,
    toastShownRef,
    
    // Utils
    logDebugEvent
  };
}
