import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';

export interface SolutionData {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  category: string;
  difficulty: string;
  tags?: string[];
}

interface SolutionDataContextType {
  solutions: Record<string, SolutionData>;
  loading: boolean;
  getSolution: (solutionId: string) => SolutionData | null;
  loadSolutions: (solutionIds: string[]) => Promise<void>;
}

const SolutionDataContext = createContext<SolutionDataContextType | undefined>(undefined);

export const SolutionDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [solutions, setSolutions] = useState<Record<string, SolutionData>>({});
  const [loading, setLoading] = useState(false);
  const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());
  const [cache, setCache] = useState<Map<string, { data: SolutionData[], timestamp: number }>>(new Map());
  const { log, logError } = useLogging();

  const loadSolutions = useCallback(async (solutionIds: string[]): Promise<void> => {
    if (!solutionIds.length) return;
    
    // Cache inteligente - 5 minutos
    const cacheKey = solutionIds.sort().join(',');
    const cached = cache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < 300000) {
      const solutionsMap: Record<string, SolutionData> = {};
      cached.data.forEach(solution => {
        solutionsMap[solution.id] = solution;
      });
      setSolutions(prev => ({ ...prev, ...solutionsMap }));
      return;
    }

    const newIds = solutionIds.filter(id => !loadedIds.has(id));
    if (newIds.length === 0) return;

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('id, title, description, category, difficulty, thumbnail_url, tags')
        .in('id', newIds);

      if (error) throw error;

      if (data) {
        const solutionsMap: Record<string, SolutionData> = {};
        data.forEach(solution => {
          solutionsMap[solution.id] = solution;
        });
        
        setSolutions(prev => ({ ...prev, ...solutionsMap }));
        setLoadedIds(prev => new Set([...prev, ...newIds]));
        
        // Atualizar cache
        setCache(prev => new Map(prev.set(cacheKey, { data, timestamp: now })));
      }
    } catch (error) {
      logError('Erro ao carregar soluções:', error);
    } finally {
      setLoading(false);
    }
  }, [loadedIds, cache, logError]);

  const getSolution = useCallback((solutionId: string): SolutionData | null => {
    return solutions[solutionId] || null;
  }, [solutions]);

  const value = useMemo(() => ({
    solutions,
    loading,
    getSolution,
    loadSolutions,
  }), [solutions, loading, getSolution, loadSolutions]);

  return (
    <SolutionDataContext.Provider value={value}>
      {children}
    </SolutionDataContext.Provider>
  );
};

export const useSolutionDataContext = () => {
  const context = useContext(SolutionDataContext);
  if (context === undefined) {
    throw new Error('useSolutionDataContext deve ser usado dentro de um SolutionDataProvider');
  }
  return context;
};