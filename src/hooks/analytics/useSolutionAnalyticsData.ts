
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface SolutionAnalyticsData {
  totalSolutions: number;
  publishedSolutions: number;
  totalImplementations: number;
  averageCompletionRate: number;
  solutionsByCategory: Array<{ name: string; value: number }>;
  solutionsByDifficulty: Array<{ name: string; value: number }>;
  topSolutions: Array<{ 
    title: string; 
    implementations: number; 
    completionRate: number;
    category: string;
  }>;
}

const defaultData: SolutionAnalyticsData = {
  totalSolutions: 0,
  publishedSolutions: 0,
  totalImplementations: 0,
  averageCompletionRate: 0,
  solutionsByCategory: [],
  solutionsByDifficulty: [],
  topSolutions: []
};

export const useSolutionAnalyticsData = (timeRange: string) => {
  const { toast } = useToast();
  const [data, setData] = useState<SolutionAnalyticsData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSolutionAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados da view de performance de soluções
      const { data: solutionsData, error: solutionsError } = await supabase
        .from('solution_performance_data')
        .select('*');

      if (solutionsError) {
        throw new Error('Erro ao carregar dados de soluções');
      }

      // Processar dados
      const totalSolutions = solutionsData?.length || 0;
      const publishedSolutions = totalSolutions; // já filtrada na view
      const totalImplementations = solutionsData?.reduce((sum, s) => sum + s.total_implementations, 0) || 0;
      const averageCompletionRate = totalSolutions > 0 ? 
        Math.round(solutionsData.reduce((sum, s) => sum + s.completion_rate, 0) / totalSolutions) : 0;

      // Agrupar por categoria
      const categoryMap = new Map();
      solutionsData?.forEach(solution => {
        const category = solution.category || 'Sem categoria';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });
      const solutionsByCategory = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

      // Agrupar por dificuldade
      const difficultyMap = new Map();
      solutionsData?.forEach(solution => {
        const difficulty = solution.difficulty || 'Não definida';
        const difficultyLabel = difficulty === 'easy' ? 'Fácil' :
                               difficulty === 'medium' ? 'Médio' :
                               difficulty === 'hard' ? 'Difícil' : 'Não definida';
        difficultyMap.set(difficultyLabel, (difficultyMap.get(difficultyLabel) || 0) + 1);
      });
      const solutionsByDifficulty = Array.from(difficultyMap.entries()).map(([name, value]) => ({ name, value }));

      // Top soluções
      const topSolutions = (solutionsData || [])
        .sort((a, b) => b.total_implementations - a.total_implementations)
        .slice(0, 10)
        .map(s => ({
          title: s.title,
          implementations: s.total_implementations,
          completionRate: s.completion_rate,
          category: s.category || 'Sem categoria'
        }));

      setData({
        totalSolutions,
        publishedSolutions,
        totalImplementations,
        averageCompletionRate,
        solutionsByCategory,
        solutionsByDifficulty,
        topSolutions
      });

    } catch (error: any) {
      console.error('Erro ao carregar analytics de soluções:', error);
      setError(error.message || 'Erro ao carregar dados de soluções');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchSolutionAnalytics();
  }, [fetchSolutionAnalytics]);

  return { data, loading, error, refresh: fetchSolutionAnalytics };
};
