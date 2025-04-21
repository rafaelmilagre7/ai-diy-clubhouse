
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

      const { data, error } = await fetchOnboardingProgress(user.id);

      if (!isMounted.current) return null;

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes("Results contain 0 rows")) {
          console.log("Criando novo registro de progresso para o usuário");
          const { data: newData, error: createError } = await createInitialOnboardingProgress(user);
          if (!createError && newData) {
            setProgress(newData);
            progressId.current = newData.id;
          }
          return newData;
        } else {
          console.error("Erro ao carregar progresso:", error);
          return null;
        }
      } else if (!data) {
        console.log("Nenhum progresso encontrado, criando novo registro.");
        const { data: newData, error: createError } = await createInitialOnboardingProgress(user);
        if (!createError && newData) {
          setProgress(newData);
          progressId.current = newData.id;
        }
        return newData;
      } else {
        console.log("Progresso carregado com sucesso:", data);
        setProgress(data);
        progressId.current = data.id;
        return data;
      }
    } catch (error: any) {
      console.error("Erro ao carregar progresso:", error);
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
    fetchProgress();
  }, [user, fetchProgress]);

  const updateProgress = async (updates: Partial<OnboardingProgress>) => {
    if (!user || !progress) {
      console.error("Usuário ou progresso não disponível");
      return null;
    }

    try {
      console.log("Atualizando progresso:", updates);
      const { data, error } = await updateOnboardingProgress(progress.id, updates);

      if (!isMounted.current) return null;

      if (error) {
        console.error("Erro ao atualizar dados:", error);
        throw error;
      }

      const updatedProgress = { ...progress, ...updates };
      setProgress(updatedProgress);
      console.log("Progresso atualizado com sucesso:", updatedProgress);
      return updatedProgress;
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
      throw error;
    }
  };

  const refreshProgress = useCallback(async () => {
    if (!user) return null;

    if (!progressId.current) {
      return await fetchProgress();
    }

    try {
      setIsLoading(true);
      const { data, error } = await refreshOnboardingProgress(progressId.current);

      if (!isMounted.current) return null;

      if (error) {
        console.error("Erro ao recarregar progresso:", error);
        throw error;
      }

      console.log("Progresso recarregado com sucesso:", data);
      setProgress(data);
      return data;
    } catch (error) {
      console.error("Erro ao recarregar progresso:", error);
      return null;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user, fetchProgress]);

  return {
    progress,
    isLoading,
    updateProgress,
    refreshProgress,
    fetchProgress
  };
};
