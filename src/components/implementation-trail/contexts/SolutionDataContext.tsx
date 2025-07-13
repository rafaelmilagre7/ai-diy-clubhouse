import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const { log, logError } = useLogging();

  const loadSolutions = async (solutionIds: string[]) => {
    // Filtrar IDs que ainda não foram carregados
    const newIds = solutionIds.filter(id => !loadedIds.has(id));
    
    if (newIds.length === 0) return;

    try {
      setLoading(true);
      log('Buscando dados das soluções (otimizado)', { newIds, total: solutionIds.length });

      const { data, error } = await supabase
        .from('solutions')
        .select('id, title, description, thumbnail_url, category, difficulty, tags')
        .in('id', newIds);

      if (error) {
        throw error;
      }

      const newSolutions = data?.reduce((acc, solution) => {
        acc[solution.id] = {
          ...solution,
          tags: Array.isArray(solution.tags) ? solution.tags : []
        };
        return acc;
      }, {} as Record<string, SolutionData>) || {};

      setSolutions(prev => ({ ...prev, ...newSolutions }));
      setLoadedIds(prev => new Set([...prev, ...newIds]));
      log('Dados das soluções carregados (otimizado)', { count: data?.length });

    } catch (error) {
      logError('Erro ao buscar dados das soluções', error);
    } finally {
      setLoading(false);
    }
  };

  const getSolution = (solutionId: string): SolutionData | null => {
    return solutions[solutionId] || null;
  };

  return (
    <SolutionDataContext.Provider value={{
      solutions,
      loading,
      getSolution,
      loadSolutions
    }}>
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