
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useProgressState } from "./progress/useProgressState";
import { useProgressFetch } from "./progress/useProgressFetch";
import { useProgressUpdate } from "./progress/useProgressUpdate";
import { useProgressRefresh } from "./progress/useProgressRefresh";

export const useProgress = () => {
  const { user } = useAuth();
  const {
    progress,
    setProgress,
    isLoading,
    setIsLoading,
    hasInitialized,
    progressId,
    isMounted,
    lastUpdateTime,
    lastError,
    retryCount,
    toastShownRef
  } = useProgressState();

  const { fetchProgress } = useProgressFetch(
    isMounted,
    setProgress,
    setIsLoading,
    progressId,
    lastError,
    retryCount
  );

  const { refreshProgress } = useProgressRefresh(
    progressId,
    setIsLoading,
    lastError,
    isMounted,
    setProgress,
    retryCount,
    fetchProgress
  );

  const { updateProgress } = useProgressUpdate(
    progress,
    setProgress,
    toastShownRef,
    lastError,
    refreshProgress
  );

  useEffect(() => {
    isMounted.current = true;
    toastShownRef.current = false;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!user || hasInitialized.current) return;
    console.log("Inicializando useProgress, buscando dados...");
    fetchProgress();
    hasInitialized.current = true;
  }, [user, fetchProgress]);

  return {
    progress,
    isLoading,
    updateProgress,
    refreshProgress,
    fetchProgress,
    lastError: lastError.current
  };
};
