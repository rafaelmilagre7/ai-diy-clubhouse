
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { Solution } from '@/types/supabaseTypes';
import { useLogging } from '@/hooks/useLogging';
import { toast } from 'sonner';

export const useSolutionData = (solutionId: string | undefined) => {
  const { user } = useAuth();
  const { log, logError } = useLogging('useSolutionData');
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [networkError, setNetworkError] = useState(false);
  const MAX_RETRIES = 2;

  const fetchSolutionData = useCallback(async (ignoreCache = false) => {
    if (!solutionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setNetworkError(false);
      log('Buscando dados da solução', { 
        solutionId, 
        retryAttempt: retryAttempts,
        user: user?.id 
      });

      // Configurar timeout para a requisição
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 10000); // 10 segundos timeout

      try {
        // CORREÇÃO CRÍTICA: Verificar ID válido antes de fazer requisição
        if (!solutionId || typeof solutionId !== 'string' || solutionId.trim() === '') {
          throw new Error('ID da solução é inválido ou não foi fornecido');
        }
        
        // CORREÇÃO CRÍTICA: Buscar solução diretamente usando método correto
        const { data, error } = await supabase
          .from('solutions')
          .select('*')
          .eq('id', solutionId)
          .single(); // Usar single() para obter exatamente um resultado ou erro
        
        clearTimeout(timeoutId);
        
        if (error) {
          // CORREÇÃO: Identificar especificamente o erro de "não encontrado" vs outros erros
          if (error.code === 'PGRST116') {
            throw new Error(`Solução com ID ${solutionId} não encontrada`);
          }
          throw error;
        }
        
        if (!data) {
          throw new Error(`Solução com ID ${solutionId} não encontrada`);
        }
        
        // CORREÇÃO: Registrar detalhes da solução encontrada
        log('Solução encontrada com sucesso', { 
          id: data.id, 
          title: data.title, 
          category: data.category 
        });
        
        setSolution(data);
        setError(null);
        
        // Buscar progresso do usuário
        if (user) {
          const { data: progressData } = await supabase
            .from('progress')
            .select('*')
            .eq('solution_id', solutionId)
            .eq('user_id', user.id)
            .maybeSingle();
          
          setProgress(progressData);
          if (progressData) {
            log('Progresso do usuário encontrado', { progressId: progressData.id });
          }
        }
        
        setRetryAttempts(0); // Resetar tentativas após sucesso
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Tempo limite excedido na requisição');
        }
        
        throw fetchError;
      }
    } catch (err: any) {
      // Log detalhado do erro
      logError('Erro ao carregar dados da solução', { 
        error: err, 
        message: err.message,
        solutionId,
        stack: err.stack
      });
      
      // Verificar se é erro de rede
      if (err.message?.includes('fetch') || 
          err.message?.includes('network') || 
          err.message?.includes('timeout') || 
          err.message?.includes('AbortError')) {
        setNetworkError(true);
      }
      
      // CORREÇÃO CRÍTICA: Limitar número de tentativas automáticas
      if (retryAttempts < MAX_RETRIES) {
        const newRetryAttempts = retryAttempts + 1;
        setRetryAttempts(newRetryAttempts);
        
        // Incrementar delay entre tentativas (backoff exponencial)
        const delay = Math.min(1000 * Math.pow(1.5, newRetryAttempts), 5000);
        log(`Tentando novamente (${newRetryAttempts}/${MAX_RETRIES}) em ${delay}ms`);
        
        setTimeout(() => {
          fetchSolutionData(true);
        }, delay);
      } else {
        // Parar de tentar após MAX_RETRIES
        setSolution(null);
        setError(err instanceof Error ? err : new Error(String(err)));
        
        if (retryAttempts >= MAX_RETRIES) {
          toast.error("Não foi possível carregar a solução após várias tentativas");
          log('Máximo de tentativas atingido, parando retentativas automáticas');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [solutionId, user, log, logError, retryAttempts]);

  // Efeito para carregar dados quando o ID mudar
  useEffect(() => {
    if (solutionId) {
      // Resetar estados quando o ID mudar
      setSolution(null);
      setProgress(null);
      setError(null);
      setRetryAttempts(0);
      setNetworkError(false);
      
      // Pequeno delay para evitar requisições em cascata
      const timeoutId = setTimeout(() => {
        fetchSolutionData();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [solutionId, fetchSolutionData]);

  // Função para tentar manualmente
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
