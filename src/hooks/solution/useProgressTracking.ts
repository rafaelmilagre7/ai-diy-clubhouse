
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';

export const useProgressTracking = (solutionId: string | undefined) => {
  const [progress, setProgress] = useState<any>(null);
  const { user } = useAuth();
  const { log, logError } = useLogging('useProgressTracking');

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user || !solutionId) return;

      try {
        const { data: progressData, error } = await supabase
          .from('progress')
          .select('*')
          .eq('solution_id', solutionId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (progressData) {
          log('Progresso encontrado', { progressId: progressData.id });
          setProgress(progressData);
        }
      } catch (err) {
        logError('Erro ao buscar progresso:', err);
      }
    };

    fetchProgress();
  }, [solutionId, user, log, logError]);

  return { progress };
};
