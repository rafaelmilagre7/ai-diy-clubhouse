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
  // Cache persistente entre sessões - 30 minutos
  const [solutions, setSolutions] = useState<Record<string, SolutionData>>(() => {
    try {
      const stored = sessionStorage.getItem('trail_solutions_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < 1800000) { // 30 minutos
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar cache de soluções:', error);
    }
    return {};
  });
  
  const [loading, setLoading] = useState(false);
  const [requestInProgress, setRequestInProgress] = useState<Set<string>>(new Set());
  const { logError } = useLogging();

  // Salvar no sessionStorage sempre que solutions mudar
  useEffect(() => {
    if (Object.keys(solutions).length > 0) {
      try {
        sessionStorage.setItem('trail_solutions_cache', JSON.stringify({
          data: solutions,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.warn('Erro ao salvar cache de soluções:', error);
      }
    }
  }, [solutions]);

  const loadSolutions = useCallback(async (solutionIds: string[]): Promise<void> => {
    if (!solutionIds.length) return;
    
    // Verificar quais soluções já temos
    const missingIds = solutionIds.filter(id => !solutions[id]);
    if (missingIds.length === 0) return;

    // Evitar requisições duplicadas
    const newMissingIds = missingIds.filter(id => !requestInProgress.has(id));
    if (newMissingIds.length === 0) return;

    // Marcar como em progresso
    setRequestInProgress(prev => new Set([...prev, ...newMissingIds]));
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('id, title, description, category, difficulty, thumbnail_url, tags')
        .in('id', newMissingIds);

      if (error) throw error;

      if (data) {
        const solutionsMap: Record<string, SolutionData> = {};
        data.forEach(solution => {
          solutionsMap[solution.id] = solution;
        });
        
        setSolutions(prev => ({ ...prev, ...solutionsMap }));
      }
    } catch (error) {
      logError('Erro ao carregar soluções:', error);
    } finally {
      setLoading(false);
      // Remover das requisições em progresso
      setRequestInProgress(prev => {
        const newSet = new Set(prev);
        newMissingIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    }
  }, [solutions, requestInProgress, logError]);

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