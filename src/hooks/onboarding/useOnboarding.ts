
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { OnboardingProgress } from '@/types/onboarding';
import { useQuery } from '@tanstack/react-query';

export function useOnboarding() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        console.error('Erro ao buscar progresso de onboarding:', error);
        return null;
      }
      
      return data as OnboardingProgress;
    } catch (err) {
      console.error('Erro na consulta de onboarding:', err);
      return null;
    }
  }, [user]);

  const { data: progress, error, isLoading: queryLoading, refetch } = useQuery({
    queryKey: ['onboarding-progress', user?.id],
    queryFn: fetchProgress,
    enabled: !!user,
  });

  return {
    progress,
    isLoading: isLoading || queryLoading,
    error,
    refreshProgress: refetch
  };
}
