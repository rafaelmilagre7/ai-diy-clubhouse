
import { useState, useEffect, useCallback } from 'react';
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
  const [retryAttempts, setRetryAttempts] = useState(0);
  const MAX_RETRIES = 3;

  // Função para buscar dados da solução
  const fetchSolutionData = useCallback(async (ignoreCache = false) => {
    if (!solutionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      log('Buscando dados da solução', { solutionId, retryAttempt: retryAttempts });

      let options = {};
      if (ignoreCache) {
        // Usar opção de não usar cache para atualizações forçadas
        options = { cache: 'no-store' };
      }

      // Get solution
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('id', solutionId)
        .single();

      if (error) {
        throw new Error(`Erro ao buscar solução: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('Solução não encontrada');
      }

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

          if (progressError) {
            log('Aviso: Erro ao carregar progresso', { error: progressError });
          }

          setProgress(progressData);
          if (progressData) {
            log('Dados de progresso carregados', { progress: progressData });
          }
        } catch (progressError) {
          log('Erro ao carregar progresso, continuando', { error: progressError });
        }
      }

      setError(null);
      setRetryAttempts(0); // Reset retry counter on success
    } catch (err: any) {
      logError('Erro ao carregar dados da solução', { error: err });
      console.error('Error fetching solution data:', err);
      
      // Se ainda estamos dentro do limite de tentativas
      if (retryAttempts < MAX_RETRIES) {
        const newRetryAttempts = retryAttempts + 1;
        setRetryAttempts(newRetryAttempts);
        
        // Backoff exponencial - aumenta o tempo entre tentativas
        const delay = Math.min(1000 * Math.pow(1.5, newRetryAttempts), 5000);
        log(`Reagendando tentativa ${newRetryAttempts}/${MAX_RETRIES} em ${delay}ms`, { solutionId });
        
        setTimeout(() => {
          fetchSolutionData(true); // Ignore cache on retry
        }, delay);
      } else {
        // Atingiu o máximo de tentativas, define o erro
        setSolution(null);
        setError(err);
        log('Máximo de tentativas atingido', { solutionId, maxRetries: MAX_RETRIES });
      }
    } finally {
      setLoading(false);
    }
  }, [solutionId, user, log, logError, retryAttempts]);

  useEffect(() => {
    // Reset state when solutionId changes
    if (solutionId) {
      setSolution(null);
      setProgress(null);
      setError(null);
      setRetryAttempts(0);
      fetchSolutionData();
    }
  }, [solutionId, fetchSolutionData]);

  // Function to refetch data
  const refetch = async () => {
    setError(null);
    setRetryAttempts(0);
    return fetchSolutionData(true); // Force fresh data on manual refetch
  };

  return { solution, setSolution, loading, error, progress, refetch };
};
