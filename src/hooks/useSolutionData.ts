
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase, fetchSolutionById, checkSolutionExists } from '@/lib/supabase';
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
  const [notFoundError, setNotFoundError] = useState(false);
  const MAX_RETRIES = 1; // Limitamos a apenas uma tentativa para evitar loops infinitos

  const fetchSolutionData = useCallback(async (ignoreCache = false) => {
    if (!solutionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setNetworkError(false);
      setNotFoundError(false);
      log('Buscando dados da solução', { 
        solutionId, 
        retryAttempt: retryAttempts,
        user: user?.id 
      });

      // Verificar se a solução existe antes de tentar carregá-la
      const exists = await checkSolutionExists(solutionId);
      
      if (!exists) {
        log('Solução não encontrada na verificação prévia', { solutionId });
        setNotFoundError(true);
        setError(new Error(`Solução com ID ${solutionId} não encontrada no banco de dados`));
        setLoading(false);
        return;
      }

      // Configurar timeout para a requisição
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 10000); // 10 segundos timeout

      try {
        // CORREÇÃO CRÍTICA: Verificar ID válido antes de fazer requisição
        if (!solutionId || typeof solutionId !== 'string' || solutionId.trim() === '') {
          throw new Error('ID da solução é inválido ou não foi fornecido');
        }
        
        // Usar a função fetchSolutionById refatorada
        const data = await fetchSolutionById(solutionId);
        
        clearTimeout(timeoutId);
        
        if (!data) {
          setNotFoundError(true);
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
          try {
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
          } catch (progressError) {
            logError('Erro ao buscar progresso do usuário', { error: progressError });
            // Não interrompe o fluxo principal se houver erro no progresso
          }
        }
        
        setRetryAttempts(0); // Resetar tentativas após sucesso
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Tempo limite excedido na requisição');
        }
        
        // Se o erro indicar que a solução não foi encontrada
        if (fetchError.message && fetchError.message.includes('não encontrada')) {
          setNotFoundError(true);
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
      if (retryAttempts < MAX_RETRIES && !notFoundError) {
        const newRetryAttempts = retryAttempts + 1;
        setRetryAttempts(newRetryAttempts);
        
        // Incrementar delay entre tentativas (backoff exponencial)
        const delay = Math.min(1000 * Math.pow(1.5, newRetryAttempts), 5000);
        log(`Tentando novamente (${newRetryAttempts}/${MAX_RETRIES}) em ${delay}ms`);
        
        setTimeout(() => {
          fetchSolutionData(true);
        }, delay);
      } else {
        // Parar de tentar após MAX_RETRIES ou se for erro de "não encontrado"
        setSolution(null);
        setError(err instanceof Error ? err : new Error(String(err)));
        
        if (retryAttempts >= MAX_RETRIES && !notFoundError) {
          toast.error("Não foi possível carregar a solução após várias tentativas");
          log('Máximo de tentativas atingido, parando retentativas automáticas');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [solutionId, user, log, logError, retryAttempts, notFoundError]);

  // Efeito para carregar dados quando o ID mudar
  useEffect(() => {
    if (solutionId) {
      // Resetar estados quando o ID mudar
      setSolution(null);
      setProgress(null);
      setError(null);
      setRetryAttempts(0);
      setNetworkError(false);
      setNotFoundError(false);
      
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
    setNotFoundError(false);
    return fetchSolutionData(true);
  }, [fetchSolutionData]);

  return { 
    solution, 
    setSolution, 
    loading, 
    error, 
    progress, 
    refetch,
    networkError,
    notFoundError
  };
};
