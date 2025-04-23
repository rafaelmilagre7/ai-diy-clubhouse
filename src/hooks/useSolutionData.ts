
import { useQuery } from '@tanstack/react-query';
import { Solution } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import { useState } from 'react';
import { useAvailableSolutions } from './solution/useAvailableSolutions';
import { useErrorHandling } from './solution/useErrorHandling';

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
    refetch
  } = useQuery({
    queryKey: ['solution', solutionId],
    queryFn: async () => {
      try {
        log('Buscando solução', { id: solutionId });
        
        const { data, error } = await supabase
          .from('solutions')
          .select('*, modules(*)')
          .eq('id', solutionId)
          .single();

        if (error) throw error;

        if (!data) {
          throw new Error(`Solução com ID ${solutionId} não encontrada`);
        }

        log('Solução carregada com sucesso', { 
          id: data.id,
          title: data.title,
          modules: data.modules?.length || 0
        });
        
        setSolution(data as Solution);
        return data as Solution;
      } catch (err) {
        logError('Erro ao buscar solução:', err);
        handleError(err);
        throw err;
      }
    },
    enabled: !!solutionId
  });

  // Função para verificar o status da conexão
  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const { data, error } = await supabase.from('_health').select('*').limit(1).maybeSingle();
      setConnectionStatus(error ? 'offline' : 'online');
    } catch (err) {
      setConnectionStatus('offline');
    }
  };

  // Para manter compatibilidade com o código existente
  const progress = data?.progress || null;

  // Para compatibilidade com componentes que usam a antiga API
  return { 
    solution: solution || data, // Usar state local primeiro, depois dados da query
    loading: isLoading,
    isLoading,
    error: error || errorHandling,
    networkError,
    notFoundError,
    progress,
    refetch,
    setSolution,
    availableSolutions,
    connectionStatus,
    checkConnection,
    implementationMetrics
  };
};
