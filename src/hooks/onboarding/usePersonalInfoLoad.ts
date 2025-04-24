
// Controle de loading, tentativas e erros no onboarding de dados pessoais
import { useState, useCallback, useEffect } from "react";
import { useProgress } from "./useProgress";

interface UsePersonalInfoLoadResult {
  loadingAttempts: number;
  setLoadingAttempts: React.Dispatch<React.SetStateAction<number>>;
  loadError: string | null;
  setLoadError: React.Dispatch<React.SetStateAction<string | null>>;
  progressLoading: boolean;
  progress: any;
  lastError: any;
  refreshProgress: () => Promise<void>;
  attemptDataLoad: (loadInitialData: () => void) => Promise<void>;
}

export function usePersonalInfoLoad() : UsePersonalInfoLoadResult {
  const [loadingAttempts, setLoadingAttempts] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { isLoading: progressLoading, refreshProgress, lastError, progress } = useProgress();

  // Função para tentar carregar dados com tratamento de erros
  const attemptDataLoad = useCallback(async (loadInitialData: () => void) => {
    try {
      setLoadError(null);
      // console.log("[DEBUG] Tentativa #" + (loadingAttempts + 1) + " de carregar dados");
      await refreshProgress();
      // console.log("[DEBUG] Dados de progresso atualizados:", progress);
      loadInitialData();
      setLoadingAttempts(prev => prev + 1);
    } catch (error) {
      // console.error("[ERRO] Falha ao carregar dados:", error);
      setLoadError("Erro ao carregar dados. Por favor, tente novamente.");
    }
  }, [refreshProgress, progress, loadingAttempts]);

  return {
    loadingAttempts,
    setLoadingAttempts,
    loadError,
    setLoadError,
    progressLoading,
    progress,
    lastError,
    refreshProgress,
    attemptDataLoad
  };
}
