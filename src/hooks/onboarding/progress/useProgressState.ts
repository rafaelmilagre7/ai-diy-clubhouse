
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

  return {
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
  };
}
