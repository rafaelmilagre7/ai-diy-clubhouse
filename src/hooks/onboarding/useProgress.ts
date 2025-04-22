
import { useState, useCallback, useEffect } from "react";
import { OnboardingProgress } from "@/types/onboarding";
import { getOnboardingProgress } from "./persistence/getOnboardingProgress";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export interface UseProgressReturn {
  progress: OnboardingProgress | null;
  isLoading: boolean;
  updateProgress: (updates: Partial<OnboardingProgress>) => Promise<any>;
  refreshProgress: () => Promise<void>;
  fetchProgress: () => Promise<OnboardingProgress | null>;
  resetProgress: () => Promise<void>;
  lastError: Error | null;
  // Propriedades adicionadas para o PersonalInfoContainer
  loadingAttempts: number;
  setLoadingAttempts: React.Dispatch<React.SetStateAction<number>>;
  loadError: string | null;
  progressLoading: boolean;
  attemptDataLoad: (loadInitialData: () => void) => Promise<void>;
}

export function useProgress(): UseProgressReturn {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [loadingAttempts, setLoadingAttempts] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProgress = useCallback(async (): Promise<OnboardingProgress | null> => {
    if (!user) {
      console.log("Usuário não autenticado, não é possível carregar progresso");
      setIsLoading(false);
      return null;
    }

    try {
      console.log("Buscando progresso de onboarding para o usuário:", user.id);
      const result = await getOnboardingProgress(user.id);
      
      console.log("Progresso obtido:", result);
      setProgress(result);
      setLastError(null);
      return result;
    } catch (error) {
      console.error("Erro ao buscar progresso:", error);
      setLastError(error as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refreshProgress = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    await fetchProgress();
  }, [fetchProgress]);

  const updateProgress = useCallback(
    async (updates: Partial<OnboardingProgress>): Promise<any> => {
      if (!user || !progress) {
        console.warn("Não foi possível atualizar: usuário não autenticado ou progresso não inicializado");
        return null;
      }

      try {
        console.log("Atualizando progresso com:", updates);
        
        const { data, error } = await supabase
          .from("onboarding")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (error) {
          console.error("Erro ao atualizar progresso:", error);
          throw error;
        }

        console.log("Progresso atualizado com sucesso:", data);
        
        // Atualiza o progresso local com os novos dados
        setProgress((prev) => {
          if (!prev) return updates as OnboardingProgress;
          return { ...prev, ...updates };
        });

        return data;
      } catch (error) {
        console.error("Erro ao atualizar progresso:", error);
        toast.error("Erro ao salvar dados. Tente novamente.");
        throw error;
      }
    },
    [user, progress]
  );

  const resetProgress = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      console.log("Resetando progresso para o usuário:", user.id);
      
      const { error } = await supabase
        .from("onboarding")
        .update({
          current_step: "personal",
          completed_steps: [],
          is_completed: false,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProgress();
      console.log("Progresso resetado com sucesso");
    } catch (error) {
      console.error("Erro ao resetar progresso:", error);
      toast.error("Erro ao resetar seu progresso. Tente novamente.");
    }
  }, [user, refreshProgress]);

  // Função para tentar carregar dados com tratamento de erros
  const attemptDataLoad = useCallback(async (loadInitialData: () => void) => {
    try {
      setLoadError(null);
      console.log("Tentativa #" + (loadingAttempts + 1) + " de carregar dados");
      await refreshProgress();
      console.log("Dados de progresso atualizados:", progress);
      loadInitialData();
      setLoadingAttempts(prev => prev + 1);
    } catch (error) {
      console.error("Falha ao carregar dados:", error);
      setLoadError("Erro ao carregar dados. Por favor, tente novamente.");
    }
  }, [refreshProgress, progress, loadingAttempts]);

  // Carregar progresso ao montar o componente
  useEffect(() => {
    if (user) {
      fetchProgress();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchProgress]);

  return {
    progress,
    isLoading,
    updateProgress,
    refreshProgress,
    fetchProgress,
    resetProgress,
    lastError,
    // Propriedades adicionadas para o PersonalInfoContainer
    loadingAttempts,
    setLoadingAttempts,
    loadError,
    progressLoading: isLoading,
    attemptDataLoad
  };
}
