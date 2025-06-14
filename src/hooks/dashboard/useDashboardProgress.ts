
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery } from '@tanstack/react-query';

// Cache otimizado com WeakMap para melhor performance
const progressCache = new WeakMap<object, any>();

export const useDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  
  // Estabilizar dependências usando refs para evitar loops infinitos
  const stableSolutions = useRef<Solution[]>([]);
  const solutionsHash = useRef<string>('');
  
  // Memoizar hash das soluções para evitar recálculos - DEPENDÊNCIA ESTÁVEL
  const currentHash = useMemo(() => {
    if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
      return 'empty';
    }
    
    const ids = solutions.map(s => s.id).sort().join(',');
    const hash = `${ids}_${solutions.length}`;
    
    // Só atualizar se realmente mudou
    if (hash !== solutionsHash.current) {
      solutionsHash.current = hash;
      stableSolutions.current = solutions;
    }
    
    return solutionsHash.current;
  }, [solutions]);

  // Função de fetch otimizada e estável
  const fetchProgress = useCallback(async () => {
    if (!user?.id) {
      throw new Error("Usuário não autenticado");
    }
    
    try {
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id);
        
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error("Erro ao buscar progresso:", error);
      throw error;
    }
  }, [user?.id]); // DEPENDÊNCIA ESTÁVEL
  
  // Query otimizada com configurações de performance máxima
  const { 
    data: progressData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['dashboard-progress', user?.id, currentHash],
    queryFn: fetchProgress,
    staleTime: 10 * 60 * 1000, // 10 minutos de cache
    gcTime: 30 * 60 * 1000, // 30 minutos no cache
    enabled: !!(user?.id && currentHash !== 'empty'),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    // Cache inteligente com deduplicação
    structuralSharing: true,
  });

  // Processar dados com memoização inteligente e cache
  const processedData = useMemo(() => {
    const currentSolutions = stableSolutions.current;
    
    if (!currentSolutions || !Array.isArray(currentSolutions) || currentSolutions.length === 0) {
      return { 
        active: [], 
        completed: [], 
        recommended: [],
        isEmpty: true
      };
    }

    if (!progressData || !Array.isArray(progressData)) {
      return { 
        active: [], 
        completed: [], 
        recommended: currentSolutions,
        isEmpty: false
      };
    }

    try {
      // Cache no WeakMap para performance máxima
      const cacheKey = { solutions: currentSolutions, progress: progressData };
      if (progressCache.has(cacheKey)) {
        return progressCache.get(cacheKey);
      }

      // Usar Map para performance O(1) na busca
      const progressMap = new Map(
        progressData.map(progress => [progress.solution_id, progress])
      );

      // Categorizar soluções de forma eficiente
      const categorizedSolutions = currentSolutions.reduce((acc, solution) => {
        const progress = progressMap.get(solution.id);
        
        if (!progress) {
          acc.recommended.push(solution);
        } else if (progress.is_completed) {
          acc.completed.push(solution);
        } else {
          acc.active.push(solution);
        }
        
        return acc;
      }, {
        active: [] as Solution[],
        completed: [] as Solution[],
        recommended: [] as Solution[]
      });

      const result = {
        ...categorizedSolutions,
        isEmpty: false
      };

      // Armazenar no cache
      progressCache.set(cacheKey, result);
      
      return result;
    } catch (err) {
      console.error("Erro ao processar dados:", err);
      return { 
        active: [], 
        completed: [], 
        recommended: currentSolutions,
        isEmpty: false
      };
    }
  }, [progressData]); // DEPENDÊNCIA ESTÁVEL

  return {
    active: processedData.active,
    completed: processedData.completed,
    recommended: processedData.recommended,
    loading: isLoading,
    error,
    isEmpty: processedData.isEmpty
  };
};
