
import { useState, useEffect } from 'react';
import { useProgress } from './useProgress';
import { OnboardingProgress } from '@/types/onboarding';

export function useOnboarding() {
  const { progress, isLoading, refreshProgress } = useProgress();
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    if (progress) {
      // Calcular a porcentagem de progresso com base nos passos completados
      const totalSteps = 8; // Número total de etapas
      const completedCount = progress.completed_steps?.length || 0;
      const percentage = Math.min(Math.round((completedCount / totalSteps) * 100), 100);
      setProgressPercentage(percentage);
    }
  }, [progress]);

  return {
    progress,
    loading: isLoading,
    progressPercentage,
    refreshProgress
  };
}
