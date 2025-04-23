
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import {
  useInitialFetch,
  useProgressTracking,
  useAvailableSolutions,
  useErrorHandling
} from './solution';

export const useSolutionData = (solutionId: string | undefined) => {
  const { log } = useLogging('useSolutionData');
  
  const { solution, loading, error, setSolution } = useInitialFetch(solutionId);
  const { progress } = useProgressTracking(solutionId);
  const { availableSolutions } = useAvailableSolutions();
  const { networkError, notFoundError, handleError } = useErrorHandling();

  const refetch = useCallback(async () => {
    if (!solutionId) return;

    try {
      log('Recarregando dados da solução', { solutionId });
      
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('id', solutionId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error(`Solução não encontrada: ${solutionId}`);

      setSolution(data);
    } catch (err) {
      handleError(err);
    }
  }, [solutionId, log, setSolution, handleError]);

  return {
    solution,
    loading,
    error,
    progress,
    refetch,
    networkError,
    notFoundError,
    availableSolutions,
    setSolution // Importante: incluir setSolution no retorno
  };
};
