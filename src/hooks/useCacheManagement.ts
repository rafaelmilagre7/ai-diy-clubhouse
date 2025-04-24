
import { useEffect } from 'react';
import { queryClient } from '@/lib/react-query';
import { useLogging } from '@/hooks/useLogging';
import { Solution } from '@/lib/supabase';

/**
 * Hook para gerenciar o cache de soluções
 */
export const useCacheManagement = () => {
  const { log } = useLogging('useCacheManagement');

  // Preload de soluções disponíveis
  const prefetchAvailableSolutions = async () => {
    log('Prefetching soluções disponíveis');
    await queryClient.prefetchQuery({
      queryKey: ['availableSolutions'],
      staleTime: 5 * 60 * 1000 // 5 minutos
    });
  };

  // Prefetch de uma solução específica
  const prefetchSolution = async (solutionId: string) => {
    if (!solutionId) return;
    
    log('Prefetching solução específica', { id: solutionId });
    await queryClient.prefetchQuery({
      queryKey: ['solution', solutionId],
      staleTime: 5 * 60 * 1000 // 5 minutos
    });
  };

  // Invalidar cache de uma solução
  const invalidateSolution = (solutionId: string) => {
    if (!solutionId) return;
    
    log('Invalidando cache da solução', { id: solutionId });
    queryClient.invalidateQueries({ queryKey: ['solution', solutionId] });
  };

  // Priming do cache com uma solução já obtida
  const primeSolutionCache = (solution: Solution) => {
    if (!solution || !solution.id) return;
    
    log('Prime do cache de solução', { id: solution.id });
    queryClient.setQueryData(['solution', solution.id], solution);
  };

  return {
    prefetchAvailableSolutions,
    prefetchSolution,
    invalidateSolution,
    primeSolutionCache
  };
};
