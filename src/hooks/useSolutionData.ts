
import { useCallback, useState, useEffect } from 'react';
import { supabase, fetchSolutionById, checkSolutionExists, getAllSolutions } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import {
  useInitialFetch,
  useProgressTracking,
  useAvailableSolutions,
  useErrorHandling
} from './solution';
import { toast } from 'sonner';
import { Solution, Progress } from '@/types/supabaseTypes';

export const useSolutionData = (solutionId: string | undefined) => {
  const { log } = useLogging('useSolutionData');
  
  // Utilizamos os hooks especializados
  const { solution, loading, error, setSolution } = useInitialFetch(solutionId);
  const { progress, updateProgress } = useProgressTracking(solutionId);
  const { availableSolutions } = useAvailableSolutions();
  const { networkError, notFoundError, handleError } = useErrorHandling();

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('connected');
  const [implementationMetrics, setImplementationMetrics] = useState<any>(null);
  
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
      
      // Buscar métricas de implementação se disponíveis
      await fetchImplementationMetrics(solutionId);
    } catch (err) {
      handleError(err);
      // Tenta verificar a conexão com o Supabase para diagnóstico
      await checkConnection();
    }
  }, [solutionId, log, setSolution, handleError, checkConnection]);

  // Nova função para buscar métricas de implementação
  const fetchImplementationMetrics = useCallback(async (solutionId: string) => {
    try {
      const { data, error } = await supabase
        .from('solution_implementation_metrics')
        .select('*')
        .eq('solution_id', solutionId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setImplementationMetrics(data);
        log('Métricas de implementação carregadas', { metricsId: data.id });
      }
    } catch (err) {
      log('Erro ao buscar métricas de implementação', { error: err });
      // Não exibimos toast aqui pois é uma funcionalidade complementar
    }
  }, [log]);
  
  // Função para atualizar as métricas de implementação
  const updateImplementationMetrics = useCallback(async (metricsData: Partial<any>) => {
    if (!solutionId) return;
    
    try {
      const { data: existingMetrics } = await supabase
        .from('solution_implementation_metrics')
        .select('*')
        .eq('solution_id', solutionId)
        .maybeSingle();
      
      if (existingMetrics) {
        // Atualizar métricas existentes
        const { data, error } = await supabase
          .from('solution_implementation_metrics')
          .update(metricsData)
          .eq('id', existingMetrics.id)
          .select()
          .single();
        
        if (error) throw error;
        
        setImplementationMetrics(data);
        log('Métricas de implementação atualizadas', { metricsId: data.id });
      } else {
        // Criar novas métricas
        const { data, error } = await supabase
          .from('solution_implementation_metrics')
          .insert({
            solution_id: solutionId,
            ...metricsData
          })
          .select()
          .single();
        
        if (error) throw error;
        
        setImplementationMetrics(data);
        log('Métricas de implementação criadas', { metricsId: data.id });
      }
    } catch (err) {
      log('Erro ao atualizar métricas de implementação', { error: err });
    }
  }, [solutionId, log]);

  // Carregar métricas de implementação ao montar o componente
  useEffect(() => {
    if (solutionId) {
      fetchImplementationMetrics(solutionId);
    }
  }, [solutionId, fetchImplementationMetrics]);

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
    setSolution,
    implementationMetrics,
    updateImplementationMetrics,
    updateProgress
  };
};
