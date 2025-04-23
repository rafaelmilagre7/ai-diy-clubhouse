
import { useQuery } from '@tanstack/react-query';
import { Solution } from '@/types/solution';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import { useState, useEffect } from 'react';
import { useAvailableSolutions } from './useAvailableSolutions';
import { useErrorHandling } from './useErrorHandling';
import { queryClient } from '@/lib/react-query';
import { toast } from 'sonner';

export const useSolutionData = (solutionId: string) => {
  const { log, logError } = useLogging('useSolutionData');
  const [solution, setSolution] = useState<Solution | null>(null);
  const { availableSolutions } = useAvailableSolutions();
  const { error: errorHandling, networkError, notFoundError, handleError } = useErrorHandling();
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [implementationMetrics, setImplementationMetrics] = useState<any | null>(null);

  const { 
    data, 
    isLoading, 
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['solution', solutionId],
    queryFn: async () => {
      try {
        log('Buscando solução', { id: solutionId });
        
        // Se não há ID, não buscar dados
        if (!solutionId) {
          log('ID da solução não fornecido');
          return null;
        }

        // Log para debug de problemas de carregamento
        console.log('Iniciando fetch da solução com ID:', solutionId);
        
        // Verificar se já temos os dados em cache
        const cachedData = queryClient.getQueryData<Solution>(['solution', solutionId]);
        if (cachedData) {
          log('Solução encontrada em cache', { 
            id: cachedData.id,
            title: cachedData.title
          });
          console.log('Dados do cache:', cachedData);
          setSolution(cachedData);
          return cachedData;
        }
        
        // Caso não tenha em cache, buscar do servidor
        const { data, error } = await supabase
          .from('solutions')
          .select('*, modules(*)')
          .eq('id', solutionId)
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar solução:', error);
          throw error;
        }

        if (!data) {
          console.error(`Solução não encontrada: ${solutionId}`);
          throw new Error(`Solução com ID ${solutionId} não encontrada`);
        }

        console.log('Dados recebidos do Supabase:', data);
        
        log('Solução encontrada com sucesso', { 
          id: data.id,
          title: data.title,
          modules: data.modules?.length || 0
        });
        
        setSolution(data as Solution);
        return data as Solution;
      } catch (err) {
        logError('Erro ao buscar solução:', err);
        handleError(err);
        
        // Notificar o usuário sobre erros de conexão
        if (navigator.onLine === false || (err instanceof Error && 
            err.message && err.message.toLowerCase().includes('network'))) {
          toast.error("Erro de conexão", {
            description: "Verifique sua conexão com a internet e tente novamente."
          });
        }
        
        throw err;
      }
    },
    enabled: !!solutionId,
    staleTime: 3 * 60 * 1000, // 3 minutos de cache
    retry: 2,
    retryDelay: attempt => Math.min(1000 * Math.pow(1.5, attempt), 10000),
    refetchOnWindowFocus: false
  });

  // Efeito para garantir que o solution state seja atualizado corretamente
  useEffect(() => {
    if (data && !solution) {
      console.log("Atualizando estado interno da solução com dados recebidos:", data);
      setSolution(data);
    }
  }, [data, solution]);

  // Carregar métricas de implementação se tivermos uma solução
  useEffect(() => {
    if (solution?.id) {
      const fetchMetrics = async () => {
        try {
          const { data: metrics, error: metricsError } = await supabase
            .from('solution_metrics')
            .select('*')
            .eq('solution_id', solution.id)
            .maybeSingle();
            
          if (!metricsError && metrics) {
            setImplementationMetrics(metrics);
          }
        } catch (err) {
          // Falha silenciosa para métricas - não são críticas
          log('Erro ao buscar métricas (não crítico):', { error: err });
        }
      };
      
      fetchMetrics();
    }
  }, [solution?.id]);

  // Verificar o status da conexão
  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const { data, error } = await supabase.from('_health').select('*').limit(1).maybeSingle();
      setConnectionStatus(error ? 'offline' : 'online');
    } catch (err) {
      setConnectionStatus('offline');
    }
  };

  return { 
    solution: solution || data, 
    loading: isLoading,
    isLoading,
    isFetching,
    error: error || errorHandling,
    networkError,
    notFoundError,
    progress: data?.progress || null,
    refetch,
    setSolution,
    availableSolutions,
    connectionStatus,
    checkConnection,
    implementationMetrics
  };
};
