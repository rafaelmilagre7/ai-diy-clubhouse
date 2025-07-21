
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { useQuery } from '@tanstack/react-query';

// Cache local otimizado
const progressCache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos

export const useDashboardProgress = (solutions: Solution[] = []) => {
  const { user } = useAuth();
  
  // Hash estável das soluções para otimização
  const solutionsHash = useMemo(() => {
    if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
      return 'empty';
    }
    return solutions.map(s => s.id).sort().join(',');
  }, [solutions]);
  
  // Função de busca otimizada e defensiva
  const fetchProgress = useCallback(async () => {
    if (!user?.id) {
      console.log('🔍 Usuário não autenticado para buscar progresso');
      return [];
    }
    
    // Verificar cache local primeiro
    const cacheKey = `progress_${user.id}`;
    const cached = progressCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('📦 Usando progresso do cache');
      return cached.data;
    }
    
    try {
      console.log('🔄 Buscando progresso do usuário no banco...');
      
      // Query otimizada com timeout
      const { data, error } = await Promise.race([
        supabase
          .from("progress")
          .select("solution_id, is_completed, completed_at, last_activity, created_at")
          .eq("user_id", user.id),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 8000)
        )
      ]) as any;
        
      if (error) {
        console.error("❌ Erro na query de progresso:", error);
        // Retornar array vazio em vez de lançar erro
        return [];
      }
      
      const result = Array.isArray(data) ? data : [];
      console.log(`✅ Progresso carregado: ${result.length} registros`);
      
      // Atualizar cache local
      progressCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error("❌ Erro na execução da busca de progresso:", error);
      // Retornar array vazio em vez de lançar erro
      return [];
    }
  }, [user?.id]);
  
  // Query React Query otimizada com fallback
  const { 
    data: progressData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['dashboard-progress', user?.id],
    queryFn: fetchProgress,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!(user?.id),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: (failureCount, error) => {
      console.log(`🔄 Tentativa ${failureCount} de buscar progresso falhou:`, error);
      return failureCount < 2; // Máximo 2 tentativas
    },
    retryDelay: 2000
  });

  // Processamento otimizado com memoização e tratamento defensivo
  const processedData = useMemo(() => {
    console.log('🔄 Processando dados de progresso...', {
      solutionsCount: solutions?.length || 0,
      progressCount: progressData?.length || 0,
      solutionsHash
    });
    
    // Validação de entrada mais defensiva
    if (!Array.isArray(solutions) || solutions.length === 0) {
      console.log('⚠️ Nenhuma solução disponível');
      return { 
        active: [], 
        completed: [], 
        recommended: [],
        isEmpty: true
      };
    }

    if (!Array.isArray(progressData)) {
      console.log('📝 Nenhum progresso encontrado, todas as soluções são recomendadas');
      return { 
        active: [], 
        completed: [], 
        recommended: solutions.filter(s => s && s.id), // Filtrar soluções válidas
        isEmpty: false
      };
    }

    try {
      // Criar mapa de progresso para lookup O(1)
      const progressMap = new Map();
      progressData.forEach(progress => {
        if (progress && progress.solution_id) {
          progressMap.set(progress.solution_id, progress);
        }
      });

      // Categorização otimizada com validação
      const active: Solution[] = [];
      const completed: Solution[] = [];
      const recommended: Solution[] = [];

      solutions.forEach(solution => {
        // Validar se a solução tem dados mínimos necessários
        if (!solution || !solution.id) {
          console.warn('⚠️ Solução inválida encontrada:', solution);
          return;
        }
        
        const progress = progressMap.get(solution.id);
        
        if (!progress) {
          recommended.push(solution);
        } else if (progress.is_completed) {
          completed.push(solution);
        } else {
          active.push(solution);
        }
      });

      console.log('✅ Progresso processado com sucesso:', {
        active: active.length,
        completed: completed.length,
        recommended: recommended.length
      });

      return {
        active,
        completed,
        recommended,
        isEmpty: false
      };
    } catch (err) {
      console.error("❌ Erro no processamento de progresso:", err);
      // Fallback defensivo
      return { 
        active: [], 
        completed: [], 
        recommended: Array.isArray(solutions) ? solutions.filter(s => s && s.id) : [],
        isEmpty: false
      };
    }
  }, [solutions, progressData, solutionsHash]);

  return {
    active: processedData.active,
    completed: processedData.completed,
    recommended: processedData.recommended,
    loading: isLoading,
    error,
    isEmpty: processedData.isEmpty
  };
};

// Manter exportação do hook otimizado para compatibilidade
export const useOptimizedDashboardProgress = useDashboardProgress;

// Tipos para compatibilidade
export interface Dashboard {
  active: Solution[];
  completed: Solution[];
  recommended: Solution[];
}

export interface UserProgress {
  solution_id: string;
  is_completed: boolean;
  completed_at?: string;
  last_activity?: string;
  created_at: string;
}
