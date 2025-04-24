
import { useState, useRef } from "react";
import { OnboardingProgress } from "@/types/onboarding";

export function useProgressState() {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);
  const progressId = useRef<string | null>(null);
  const isMounted = useRef(true);
  const lastUpdateTime = useRef<number>(Date.now());
  const lastError = useRef<Error | null>(null);
  const retryCount = useRef(0);
  const toastShownRef = useRef(false);
  
  // Referência para armazenar histórico de estados para depuração
  const debugHistory = useRef<Array<{
    timestamp: number;
    action: string;
    progressId: string | null;
    data: any;
  }>>([]);
  
  // Função para registrar eventos de debug
  const logDebugEvent = (action: string, data: any = null) => {
    if (!isMounted.current) return;
    
    debugHistory.current.push({
      timestamp: Date.now(),
      action,
      progressId: progressId.current,
      data,
    });
    
    // Manter apenas os últimos 20 eventos para não consumir muita memória
    if (debugHistory.current.length > 20) {
      debugHistory.current.shift();
    }
    
    console.log(`[DEBUG STATE] ${action}`, data);
  };
  
  // Sobrescrevendo setProgress para logar alterações e evitar atualizações quando desmontado
  const setProgressWithDebug = (newProgress: OnboardingProgress | null) => {
    if (!isMounted.current) return;
    
    logDebugEvent('setProgress', {
      previousId: progress?.id,
      newId: newProgress?.id,
      hasData: !!newProgress,
    });
    setProgress(newProgress);
  };

  return {
    progress,
    setProgress: setProgressWithDebug,
    isLoading,
    setIsLoading,
    hasInitialized,
    progressId,
    isMounted,
    lastUpdateTime,
    lastError,
    retryCount,
    toastShownRef,
    debugHistory,
    logDebugEvent
  };
}
