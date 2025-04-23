
import { useCallback, useState } from 'react';
import { supabase, fetchSolutionById, checkSolutionExists, getAllSolutions } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import {
  useInitialFetch,
  useProgressTracking,
  useAvailableSolutions,
  useErrorHandling
} from './solution';
import { toast } from 'sonner';

export const useSolutionData = (solutionId: string | undefined) => {
  const { log } = useLogging('useSolutionData');
  
  // Utilizamos os hooks especializados
  const { solution, loading, error, setSolution } = useInitialFetch(solutionId);
  const { progress } = useProgressTracking(solutionId);
  const { availableSolutions } = useAvailableSolutions();
  const { networkError, notFoundError, handleError } = useErrorHandling();

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('connected');
  
  // Função para verificar a conexão com o Supabase
  const checkConnection = useCallback(async () => {
    try {
      const start = Date.now();
      const { data } = await supabase.from('solutions').select('count').limit(1).single();
      const responseTime = Date.now() - start;
      
      log('Verificação de conexão com Supabase', { responseTime, success: !!data });
      
      if (responseTime > 3000) {
        log('Conexão com Supabase está lenta', { responseTime });
        toast.warning('A conexão com o servidor está lenta. Algumas operações podem demorar mais do que o normal.');
      }
      
      setConnectionStatus('connected');
      return true;
    } catch (error) {
      log('Erro ao verificar conexão com Supabase', { error });
      setConnectionStatus('disconnected');
      return false;
    }
  }, [log]);

  // Função aprimorada para recarregar dados da solução
  const refetch = useCallback(async () => {
    if (!solutionId) return;

    try {
      log('Recarregando dados da solução', { solutionId });
      setConnectionStatus('reconnecting');
      
      // Primeiro verifica se a solução existe
      const exists = await checkSolutionExists(solutionId);
      
      if (!exists) {
        log('Solução não encontrada no banco, tentando buscar todas as soluções', { solutionId });
        const allSolutions = await getAllSolutions();
        log('Soluções disponíveis no banco', { count: allSolutions.length });
        
        if (allSolutions.length === 0) {
          throw new Error('Nenhuma solução disponível no banco de dados');
        }
        
        const matchingSolution = allSolutions.find(s => s.id === solutionId);
        
        if (!matchingSolution) {
          throw new Error(`Solução com ID ${solutionId} não encontrada no banco de dados`);
        }
        
        setSolution(matchingSolution);
        setConnectionStatus('connected');
        return;
      }
      
      // Se a solução existe, busca os detalhes completos
      const solutionData = await fetchSolutionById(solutionId);
      setSolution(solutionData);
      setConnectionStatus('connected');
    } catch (err) {
      handleError(err);
      // Tenta verificar a conexão com o Supabase para diagnóstico
      await checkConnection();
    }
  }, [solutionId, log, setSolution, handleError, checkConnection]);

  return {
    solution,
    loading,
    error,
    progress,
    refetch,
    connectionStatus,
    checkConnection,
    networkError,
    notFoundError,
    availableSolutions,
    setSolution
  };
};
