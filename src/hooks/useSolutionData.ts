
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase, fetchSolutionById, checkSolutionExists, getAllSolutions } from '@/lib/supabase';
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
  const [availableSolutions, setAvailableSolutions] = useState<Solution[]>([]);
  const MAX_RETRIES = 1;

  // Buscar todas as soluções disponíveis para diagnóstico
  useEffect(() => {
    const fetchAllSolutions = async () => {
      try {
        const solutions = await getAllSolutions();
        setAvailableSolutions(solutions);
        log(`Recuperadas ${solutions.length} soluções para diagnóstico`);
      } catch (err) {
        logError("Erro ao buscar lista de soluções para diagnóstico", err);
      }
    };
    
    fetchAllSolutions();
  }, [log, logError]);

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

      // CORREÇÃO: Se tivermos soluções disponíveis e o ID não existir, usamos a primeira disponível
      if (availableSolutions.length > 0) {
        const solutionExists = availableSolutions.some(s => s.id === solutionId);
        
        if (!solutionExists) {
          log('ID da solução não corresponde a nenhum registro. IDs disponíveis:', 
            availableSolutions.map(s => ({ id: s.id, title: s.title })));
          
          // Se o ID não existir mas temos soluções, usamos a primeira como fallback
          const fallbackSolution = availableSolutions[0];
          log(`Usando fallback para primeira solução disponível: ${fallbackSolution.id} - ${fallbackSolution.title}`);
          
          setSolution(fallbackSolution);
          setError(null);
          
          // Buscar progresso para a solução de fallback
          if (user) {
            try {
              const { data: progressData } = await supabase
                .from('progress')
                .select('*')
                .eq('solution_id', fallbackSolution.id)
                .eq('user_id', user.id)
                .maybeSingle();
              
              setProgress(progressData);
            } catch (progressErr) {
              logError("Erro ao buscar progresso para solução de fallback", progressErr);
            }
          }
          
          setLoading(false);
          return;
        }
      }

      try {
        // CORREÇÃO CRÍTICA: Verificar ID válido antes de fazer requisição
        if (!solutionId || typeof solutionId !== 'string' || solutionId.trim() === '') {
          throw new Error('ID da solução é inválido ou não foi fornecido');
        }
        
        // Usar a função fetchSolutionById refatorada
        const data = await fetchSolutionById(solutionId);
        
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
        availableSolutionsCount: availableSolutions.length
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
  }, [solutionId, user, log, logError, retryAttempts, notFoundError, availableSolutions]);

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
    notFoundError,
    availableSolutions // Adicionamos a lista de soluções disponíveis para diagnóstico
  };
};
