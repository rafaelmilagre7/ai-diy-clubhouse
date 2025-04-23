
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';

export const useSolutionData = (solutionId: string | undefined) => {
  const { user } = useAuth();
  const { log, logError } = useLogging('useSolutionData');
  const [solution, setSolution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    if (!solutionId) {
      setLoading(false);
      return;
    }

    const fetchSolutionData = async () => {
      try {
        setLoading(true);
        log('Buscando dados da solução', { solutionId });

        // Get solution
        const { data, error } = await supabase
          .from('solutions')
          .select('*')
          .eq('id', solutionId)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Solution not found');

        // Convert tags to array if it's null
        if (!data.tags) data.tags = [];

        setSolution(data);
        log('Dados da solução carregados', { solution: data });

        // Get progress if user is logged in
        if (user) {
          try {
            const { data: progressData, error: progressError } = await supabase
              .from('progress')
              .select('*')
              .eq('solution_id', solutionId)
              .eq('user_id', user.id)
              .maybeSingle();

            if (progressError) throw progressError;

            setProgress(progressData);
            log('Dados de progresso carregados', { progress: progressData });
          } catch (progressError) {
            console.error('Error fetching progress:', progressError);
            logError('Erro ao carregar progresso', { error: progressError });
          }
        }

        setError(null);
      } catch (err: any) {
        console.error('Error fetching solution data:', err);
        logError('Erro ao carregar dados da solução', { error: err });
        setSolution(null);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSolutionData();
  }, [solutionId, user, log, logError]);

  // Function to refetch data
  const refetch = async () => {
    if (solutionId) {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('solutions')
          .select('*')
          .eq('id', solutionId)
          .single();

        if (error) throw error;
        setSolution(data);
        setError(null);
        log('Dados da solução recarregados', { solution: data });
      } catch (err: any) {
        console.error('Error refetching solution data:', err);
        logError('Erro ao recarregar dados da solução', { error: err });
        setError(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return { solution, loading, error, progress, refetch };
};
