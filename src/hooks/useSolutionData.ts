
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
  const MAX_RETRIES = 2; // Reduzir para 2 tentativas para evitar loops excessivos

  const fetchSolutionData = useCallback(async (ignoreCache = false) => {
    if (!solutionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setNetworkError(false);
      log('Iniciando busca de dados da solução', { 
        solutionId, 
        retryAttempt: retryAttempts,
        user: user?.id 
      });

      // Buscar solução - com timeout para evitar requisições que ficam pendentes
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 10000); // 10 segundos timeout
      
      let solutionData;
      try {
        // Verificar se temos um ID válido
        if (!solutionId || typeof solutionId !== 'string' || solutionId.trim() === '') {
          throw new Error('ID da solução é inválido ou não foi fornecido');
        }
        
        // Buscar solução diretamente da tabela
        const { data, error } = await supabase
          .from('solutions')
          .select('*')
          .eq('id', solutionId)
          .maybeSingle();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error(`Solução com ID ${solutionId} não encontrada`);
        }
        
        solutionData = data;
        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Tempo limite excedido na requisição');
        }
        throw fetchError;
      }
      
      if (!solutionData) {
        log('Solução não encontrada', { solutionId });
        throw new Error('Solução não encontrada');
      }

      setSolution(solutionData);
      log('Dados da solução carregados com sucesso', { 
        solution: {
          id: solutionData.id,
          title: solutionData.title,
          category: solutionData.category
        }
      });

      // Buscar progresso se usuário estiver logado
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
          } else {
            setProgress(progressData);
            if (progressData) {
              log('Dados de progresso carregados', { progressId: progressData.id });
            }
          }
        } catch (progressError) {
          // Apenas log, não falhar toda a operação se o progresso falhar
          logError('Erro ao carregar dados de progresso', { 
            error: progressError
          });
        }
      }

      setError(null);
      setRetryAttempts(0);

    } catch (err: any) {
      // Log detalhado de erros
      logError('Erro ao carregar dados da solução', { 
        error: err,
        solutionId,
        message: err.message
      });
      
      if (err.message?.includes('fetch') || 
          err.message?.includes('network') || 
          err.message?.includes('timeout') || 
          err.message?.includes('AbortError')) {
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
        setError(err instanceof Error ? err : new Error(String(err)));
        toast.error("Não foi possível carregar a solução após várias tentativas");
        log('Máximo de tentativas atingido', { solutionId, maxRetries: MAX_RETRIES });
      }
    } finally {
      setLoading(false);
    }
  }, [solutionId, user, log, logError, retryAttempts, queryClient]);

  useEffect(() => {
    if (solutionId) {
      // Resetar estados quando o ID mudar
      setSolution(null);
      setProgress(null);
      setError(null);
      setRetryAttempts(0);
      setNetworkError(false);
      // Buscar dados com pequeno delay para evitar requisições em cascata
      const timeoutId = setTimeout(() => {
        fetchSolutionData();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [solutionId, fetchSolutionData]);

  const refetch = useCallback(() => {
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
