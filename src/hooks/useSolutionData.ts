
import { useQuery } from '@tanstack/react-query';
import { Solution } from '@/lib/supabase/types';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import { useState, useEffect } from 'react';
import { useAvailableSolutions } from './solution/useAvailableSolutions';
import { useErrorHandling } from './solution/useErrorHandling';
import { queryClient } from '@/lib/react-query';
import { toast } from 'sonner';
import { toSolutionCategory } from '@/lib/types/categoryTypes';

export const useSolutionData = (solutionId: string) => {
  const { log, logError } = useLogging('useSolutionData');
  const [solution, setSolution] = useState<Solution | null>(null);
  const { availableSolutions } = useAvailableSolutions();
  const { error: errorHandling, networkError, notFoundError, handleError } = useErrorHandling();
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [implementationMetrics, setImplementationMetrics] = useState<any | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [solutionProgress, setSolutionProgress] = useState<any>(null);

  // Assegurar que estamos montados para evitar atualizações de estado em componentes desmontados
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Verificar status da conexão no início
  useEffect(() => {
    if (isMounted) {
      checkConnection();
    }
  }, [isMounted]);

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

        // Verificar se já temos os dados em cache
        const cachedData = queryClient.getQueryData<Solution>(['solution', solutionId]);
        if (cachedData) {
          log('Solução encontrada em cache', { 
            id: cachedData.id,
            title: cachedData.title
          });
          
          // Garantir que a categoria esteja no formato correto
          const normalizedSolution = {
            ...cachedData,
            category: toSolutionCategory(cachedData.category)
          };
          
          if (isMounted) {
            setSolution(normalizedSolution);
            if (cachedData.progress) {
              setSolutionProgress(cachedData.progress);
            }
          }
          return normalizedSolution;
        }
        
        const { data, error } = await supabase
          .from('solutions')
          .select('*, modules(*)')
          .eq('id', solutionId)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          throw new Error(`Solução com ID ${solutionId} não encontrada`);
        }

        log('Solução carregada com sucesso', { 
          id: data.id,
          title: data.title,
          category: data.category,
          modules: data.modules?.length || 0
        });
        
        // Também buscar o progresso do usuário para esta solução, se disponível
        const { data: progressData } = await supabase
          .from('progress')
          .select('*')
          .eq('solution_id', solutionId)
          .maybeSingle();
          
        if (progressData) {
          log('Progresso encontrado para a solução', { progressData });
          setSolutionProgress(progressData);
        }
        
        // Normalizar a categoria para garantir compatibilidade
        const normalizedSolution = {
          ...data,
          category: toSolutionCategory(data.category),
          progress: progressData
        } as Solution;
        
        if (isMounted) {
          setSolution(normalizedSolution);
        }
        return normalizedSolution;
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
    enabled: !!solutionId && isMounted,
    staleTime: 3 * 60 * 1000, // 3 minutos de cache
    retry: 2,
    retryDelay: attempt => Math.min(1000 * Math.pow(1.5, attempt), 10000),
    refetchOnWindowFocus: false
  });

  // Carregar métricas de implementação se tivermos uma solução
  useEffect(() => {
    if (solution?.id && isMounted) {
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
  }, [solution?.id, isMounted, log]);

  // Função para verificar o status da conexão
  const checkConnection = async () => {
    if (!isMounted) return;
    
    setConnectionStatus('checking');
    try {
      const { data, error } = await supabase.from('_health').select('*').limit(1).maybeSingle();
      if (isMounted) {
        setConnectionStatus(error ? 'offline' : 'online');
      }
    } catch (err) {
      if (isMounted) {
        setConnectionStatus('offline');
      }
    }
  };

  // Para compatibilidade com componentes que usam a antiga API
  return { 
    solution: solution || data, // Usar state local primeiro, depois dados da query
    loading: isLoading,
    isLoading,
    isFetching,
    error: error || errorHandling,
    networkError,
    notFoundError,
    progress: solutionProgress,
    refetch,
    setSolution: (updatedSolution: Solution) => {
      // Garantir que a categoria esteja normalizada
      const normalizedSolution = {
        ...updatedSolution,
        category: toSolutionCategory(updatedSolution.category)
      } as Solution;
      
      setSolution(normalizedSolution);
    },
    availableSolutions,
    connectionStatus,
    checkConnection,
    implementationMetrics
  };
};
