
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';
import { Solution } from '@/lib/supabase';
import { toast } from 'sonner';
import { toSolutionCategory } from '@/lib/types/appTypes';

/**
 * Hook centralizado para gerenciamento de dados globais da aplicação
 * Consolida lógicas que estavam espalhadas em diversos hooks
 */
export const useCentralDataStore = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { log, logError } = useLogging('useCentralDataStore');

  // Função para buscar e normalizar soluções
  const fetchSolutions = useCallback(async () => {
    try {
      log('Buscando todas as soluções disponíveis');
      
      // Construir a consulta base
      let query = supabase
        .from('solutions')
        .select('*');

      // Aplicar filtro para soluções publicadas, exceto para admins
      if (!isAdmin) {
        query = query.eq('published', true);
      }

      // Ordenar por data de criação mais recente
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;

      if (error) throw error;
      
      // Normalizar dados, garantindo que categorias estejam no formato correto
      const normalizedSolutions = data?.map(solution => ({
        ...solution,
        category: toSolutionCategory(solution.category)
      })) as Solution[];
      
      log('Soluções carregadas com sucesso', { count: normalizedSolutions?.length || 0 });
      return normalizedSolutions || [];
      
    } catch (err) {
      logError('Erro ao buscar soluções:', err);
      toast.error("Erro ao carregar soluções", {
        description: "Tente novamente mais tarde."
      });
      return [];
    }
  }, [isAdmin, log, logError]);

  // Buscar solução individual com detalhes completos
  const fetchSolutionDetails = useCallback(async (solutionId: string) => {
    try {
      if (!solutionId) {
        return null;
      }
      
      log('Buscando detalhes da solução', { id: solutionId });
      
      const { data, error } = await supabase
        .from('solutions')
        .select('*, modules(*)')
        .eq('id', solutionId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        return null;
      }
      
      // Normalizar categoria
      const normalizedSolution = {
        ...data,
        category: toSolutionCategory(data.category)
      } as Solution;
      
      log('Detalhes da solução carregados', { title: normalizedSolution.title });
      return normalizedSolution;
      
    } catch (err) {
      logError('Erro ao buscar detalhes da solução:', err);
      return null;
    }
  }, [log, logError]);

  // Buscar progresso do usuário
  const fetchUserProgress = useCallback(async () => {
    if (!user) return [];
    
    try {
      log('Buscando progresso do usuário');
      
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      log('Progresso do usuário carregado', { count: data?.length || 0 });
      return data || [];
      
    } catch (err) {
      logError('Erro ao buscar progresso:', err);
      return [];
    }
  }, [user, log, logError]);

  // Usar React Query para gerenciar estado e cache
  const {
    data: solutions = [],
    isLoading: solutionsLoading,
    error: solutionsError
  } = useQuery({
    queryKey: ['allSolutions', isAdmin],
    queryFn: fetchSolutions,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  
  const {
    data: progress = [],
    isLoading: progressLoading,
  } = useQuery({
    queryKey: ['userProgress', user?.id],
    queryFn: fetchUserProgress,
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!user
  });

  // Classificar soluções com base no progresso
  const categorizedSolutions = useCallback(() => {
    if (!solutions || !progress) {
      return { active: [], completed: [], recommended: [] };
    }
    
    // Soluções ativas (em progresso)
    const activeSolutions = solutions.filter(solution => 
      progress.some(
        p => p.solution_id === solution.id && !p.is_completed
      )
    );
    
    // Soluções completas
    const completedSolutions = solutions.filter(solution => 
      progress.some(
        p => p.solution_id === solution.id && p.is_completed
      )
    );
    
    // Soluções recomendadas (não iniciadas)
    const recommendedSolutions = solutions.filter(solution => 
      !progress.some(p => p.solution_id === solution.id)
    );
    
    return {
      active: activeSolutions,
      completed: completedSolutions,
      recommended: recommendedSolutions
    };
  }, [solutions, progress]);

  // Pre-fetch de solução individual para melhorar performance
  const prefetchSolution = useCallback((solutionId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['solution', solutionId],
      queryFn: () => fetchSolutionDetails(solutionId),
      staleTime: 5 * 60 * 1000 // 5 minutos
    });
  }, [queryClient, fetchSolutionDetails]);

  return {
    solutions,
    progress,
    solutionsLoading,
    progressLoading,
    solutionsError,
    isLoading: solutionsLoading || progressLoading,
    categorizedSolutions: categorizedSolutions(),
    prefetchSolution,
    fetchSolutionDetails
  };
};
