
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase, fetchSolutionById } from '@/lib/supabase';
import { Solution } from '@/types/supabaseTypes';
import { useLogging } from '@/hooks/useLogging';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export const useSolutionData = (solutionId: string | undefined) => {
  const { user } = useAuth();
  const { log, logError } = useLogging('useSolutionData');
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [networkError, setNetworkError] = useState(false);
  const queryClient = useQueryClient();
  const MAX_RETRIES = 3;

  const fetchSolutionData = useCallback(async (ignoreCache = false) => {
    if (!solutionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setNetworkError(false);
      log('Buscando dados da solução', { solutionId, retryAttempt: retryAttempts });

      // Buscar solução
      const solutionData = await fetchSolutionById(solutionId);
      
      if (!solutionData) {
        throw new Error('Solução não encontrada');
      }

      setSolution(solutionData);
      log('Dados da solução carregados', { solution: solutionData });

      // Pré-carregar dados relacionados
      queryClient.prefetchQuery({
        queryKey: ['solution-modules', solutionId],
        queryFn: async () => {
          const { data } = await supabase
            .from('modules')
            .select('*')
            .eq('solution_id', solutionId)
            .order('module_order', { ascending: true });
          return data;
        },
        staleTime: 2 * 60 * 1000
      });

      // Buscar progresso se usuário estiver logado
      if (user) {
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
      }

      setError(null);
      setRetryAttempts(0);

    } catch (err: any) {
      logError('Erro ao carregar dados da solução', { error: err });
      
      if (err.message?.includes('fetch') || err.message?.includes('network')) {
        setNetworkError(true);
        if (retryAttempts === 0) {
          toast.error("Problemas de conexão. Tentando novamente...");
        }
      }
      
      if (retryAttempts < MAX_RETRIES) {
        const newRetryAttempts = retryAttempts + 1;
        setRetryAttempts(newRetryAttempts);
        
        const delay = Math.min(1000 * Math.pow(1.5, newRetryAttempts), 5000);
        log(`Reagendando tentativa ${newRetryAttempts}/${MAX_RETRIES} em ${delay}ms`, { solutionId });
        
        setTimeout(() => {
          fetchSolutionData(true);
        }, delay);
      } else {
        setSolution(null);
        setError(err);
        log('Máximo de tentativas atingido', { solutionId, maxRetries: MAX_RETRIES });
      }
    } finally {
      setLoading(false);
    }
  }, [solutionId, user, log, logError, retryAttempts, queryClient]);

  useEffect(() => {
    if (solutionId) {
      setSolution(null);
      setProgress(null);
      setError(null);
      setRetryAttempts(0);
      setNetworkError(false);
      fetchSolutionData();
    }
  }, [solutionId, fetchSolutionData]);

  const refetch = useCallback(async () => {
    setError(null);
    setRetryAttempts(0);
    return fetchSolutionData(true);
  }, [fetchSolutionData]);

  return { 
    solution, 
    setSolution, 
    loading, 
    error, 
    progress, 
    refetch,
    networkError 
  };
};
