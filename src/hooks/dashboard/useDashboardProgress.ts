
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery } from '@tanstack/react-query';
import { useLoading } from "@/contexts/LoadingContext";

// Cache otimizado para evitar recálculos desnecessários
const progressCache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos

export const useDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  const { setLoading } = useLoading();
  const lastSolutionsHashRef = useRef<string>("");
  
  // Criar hash estável das soluções para cache inteligente
  const solutionsHash = useMemo(() => {
    if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
      return 'empty';
    }
    
    // Usar apenas os IDs das soluções para o hash
    const ids = solutions.map(s => s.id).sort().join(',');
    return `${ids}_${solutions.length}`;
  }, [solutions]);

  // Função para buscar o progresso - otimizada
  const fetchProgress = useCallback(async () => {
    if (!user?.id) {
      throw new Error("Usuário não autenticado");
    }
    
    // Verificar cache primeiro
    const cacheKey = `progress_${user.id}`;
    const cached = progressCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return cached.data;
    }
    
    try {
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id);
        
      if (error) {
        console.error("useDashboardProgress: Erro ao buscar progresso:", error);
        throw error;
      }
      
      const result = data || [];
      
      // Armazenar no cache
      progressCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error("useDashboardProgress: Exception ao buscar progresso:", error);
      throw error;
    }
  }, [user?.id]);
  
  // Query otimizada com configurações melhoradas
  const { 
    data: progressData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['dashboard-progress', user?.id, solutionsHash],
    queryFn: fetchProgress,
    staleTime: CACHE_TTL, // 2 minutos de cache no React Query
    gcTime: 5 * 60 * 1000, // 5 minutos antes de garbage collection
    enabled: !!(user?.id && Array.isArray(solutions) && solutions.length > 0),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: 1,
    meta: {
      onError: (err: any) => {
        console.error("[useDashboardProgress] Erro no React Query:", err);
      }
    }
  });

  // Atualizar loading state no context
  useEffect(() => {
    setLoading('progress', isLoading);
  }, [isLoading, setLoading]);

  // Processar dados com memoização otimizada
  const processedData = useMemo(() => {
    // Se não há soluções válidas, retornar estado vazio
    if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
      return { 
        active: [], 
        completed: [], 
        recommended: [],
        isEmpty: true
      };
    }

    // Se não há dados de progresso, todas as soluções são recomendadas
    if (!progressData || !Array.isArray(progressData)) {
      return { 
        active: [], 
        completed: [], 
        recommended: solutions,
        isEmpty: false
      };
    }

    try {
      // Criar maps para performance otimizada
      const progressMap = new Map();
      progressData.forEach(progress => {
        progressMap.set(progress.solution_id, progress);
      });

      // Categorizar soluções de forma eficiente
      const active: Solution[] = [];
      const completed: Solution[] = [];
      const recommended: Solution[] = [];

      solutions.forEach(solution => {
        const progress = progressMap.get(solution.id);
        
        if (!progress) {
          recommended.push(solution);
        } else if (progress.is_completed) {
          completed.push(solution);
        } else {
          active.push(solution);
        }
      });

      return {
        active,
        completed,
        recommended,
        isEmpty: false
      };
    } catch (err) {
      console.error("useDashboardProgress: Erro ao processar dados:", err);
      return { 
        active: [], 
        completed: [], 
        recommended: solutions,
        isEmpty: false
      };
    }
  }, [solutions, progressData]);

  return {
    active: processedData.active,
    completed: processedData.completed,
    recommended: processedData.recommended,
    loading: isLoading,
    error,
    isEmpty: processedData.isEmpty
  };
};
