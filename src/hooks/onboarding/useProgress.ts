import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { OnboardingProgress } from "@/types/onboarding";
import { toast } from "sonner";
import {
  fetchOnboardingProgress,
  createInitialOnboardingProgress,
  updateOnboardingProgress,
  refreshOnboardingProgress,
} from "./persistence/progressPersistence";

export const useProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);
  const progressId = useRef<string | null>(null);
  const isMounted = useRef(true);
  const lastUpdateTime = useRef<number>(Date.now());
  const lastError = useRef<Error | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchProgress = useCallback(async () => {
    if (!user) return null;

    try {
      setIsLoading(true);
      lastError.current = null;
      console.log("Buscando progresso para o usuário:", user.id);

      const { data, error } = await fetchOnboardingProgress(user.id);

      if (!isMounted.current) return null;

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes("Results contain 0 rows")) {
          console.log("Não há progresso existente, criando novo registro");
          const { data: newData, error: createError } = await createInitialOnboardingProgress(user);
          if (!createError && newData) {
            setProgress(newData);
            progressId.current = newData.id;
            console.log("Novo progresso criado:", newData);
          } else {
            console.error("Erro ao criar novo progresso:", createError);
            lastError.current = new Error(createError?.message || "Erro ao criar progresso");
          }
          return newData;
        }
        console.error("Erro ao carregar progresso:", error);
        lastError.current = new Error(error.message);
        return null;
      }

      if (!data) {
        console.log("Nenhum progresso encontrado, criando novo registro");
        const { data: newData, error: createError } = await createInitialOnboardingProgress(user);
        if (!createError && newData) {
          setProgress(newData);
          progressId.current = newData.id;
          console.log("Novo progresso criado:", newData);
        } else {
          console.error("Erro ao criar novo progresso:", createError);
          lastError.current = new Error(createError?.message || "Erro ao criar progresso");
        }
        return newData;
      }

      console.log("Progresso carregado com sucesso:", data);
      setProgress(data);
      progressId.current = data.id;
      return data;
    } catch (error: any) {
      console.error("Erro ao carregar progresso:", error);
      lastError.current = error;
      return null;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        hasInitialized.current = true;
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user || hasInitialized.current) return;
    console.log("Inicializando useProgress, buscando dados...");
    fetchProgress();
  }, [user, fetchProgress]);

  const updateProgress = async (updates: Partial<OnboardingProgress>) => {
    if (!user || !progress) {
      console.error("Usuário ou progresso não disponível para atualização");
      throw new Error("Usuário ou progresso não disponível");
    }

    try {
      console.log("Atualizando progresso:", updates);
      lastUpdateTime.current = Date.now();
      
      const { data, error } = await updateOnboardingProgress(progress.id, updates);

      if (!isMounted.current) return null;

      if (error) {
        console.error("Erro ao atualizar dados:", error);
        lastError.current = new Error(error.message);
        throw error;
      }

      const updatedProgress = data || { ...progress, ...updates };
      setProgress(updatedProgress);
      console.log("Progresso atualizado com sucesso:", updatedProgress);
      return updatedProgress;
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
      lastError.current = error instanceof Error ? error : new Error(String(error));
      throw error;
    }
  };

  const refreshProgress = useCallback(async () => {
    if (!user) return null;

    if (!progressId.current) {
      console.log("ID de progresso não disponível, buscando dados iniciais");
      return await fetchProgress();
    }

    try {
      setIsLoading(true);
      lastError.current = null;
      console.log("Atualizando dados do progresso:", progressId.current);
      
      const { data, error } = await refreshOnboardingProgress(progressId.current);

      if (!isMounted.current) return null;

      if (error) {
        console.error("Erro ao recarregar progresso:", error);
        lastError.current = new Error(error.message);
        throw error;
      }

      console.log("Progresso recarregado com sucesso:", data);
      setProgress(data);
      return data;
    } catch (error) {
      console.error("Erro ao recarregar progresso:", error);
      lastError.current = error instanceof Error ? error : new Error(String(error));
      return null;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user, fetchProgress]);

  useEffect(() => {
    if (!user || !progressId.current) return;
    
    const checkForUpdates = async () => {
      if (Date.now() - lastUpdateTime.current > 15000) {
        console.log("Verificando atualizações no servidor...");
        await refreshProgress();
      }
    };
    
    const interval = setInterval(checkForUpdates, 20000);
    
    return () => clearInterval(interval);
  }, [user, refreshProgress]);

  return {
    progress,
    isLoading,
    updateProgress,
    refreshProgress,
    fetchProgress,
    lastError: lastError.current
  };
};
