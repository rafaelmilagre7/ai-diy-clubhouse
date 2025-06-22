
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnalyticsData {
  totalSolutions: number;
  publishedSolutions: number;
  totalImplementations: number;
  averageCompletionRate: number;
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  popularSolutions: Array<{
    name: string;
    implementations: number;
    completionRate: number;
  }>;
  completionRates: Array<{
    solutionName: string;
    completionRate: number;
  }>;
  difficultyDistribution: Array<{
    difficulty: string;
    count: number;
    percentage: number;
  }>;
}

export const useRealAnalyticsData = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalSolutions: 0,
    publishedSolutions: 0,
    totalImplementations: 0,
    averageCompletionRate: 0,
    categoryDistribution: [],
    popularSolutions: [],
    completionRates: [],
    difficultyDistribution: []
  });
  
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      // Buscar dados reais das soluções
      const { data: solutionsData, error: solutionsError } = await supabase
        .from('solutions')
        .select(`
          id,
          title,
          category,
          difficulty,
          is_published,
          user_solutions(
            id,
            is_completed,
            progress_percentage
          )
        `);

      if (solutionsError) throw solutionsError;

      const solutions = solutionsData || [];
      
      // Calcular métricas reais
      const totalSolutions = solutions.length;
      const publishedSolutions = solutions.filter(s => s.is_published).length;
      
      // Calcular implementações e taxas de conclusão
      const allImplementations = solutions.flatMap(s => s.user_solutions || []);
      const totalImplementations = allImplementations.length;
      const completedImplementations = allImplementations.filter(impl => impl.is_completed).length;
      const averageCompletionRate = totalImplementations > 0 
        ? (completedImplementations / totalImplementations) * 100 
        : 0;

      // Distribuição por categoria
      const categoryGroups = solutions.reduce((acc, solution) => {
        const category = solution.category || 'Sem categoria';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const categoryDistribution = Object.entries(categoryGroups).map(([category, count]) => ({
        category,
        count,
        percentage: totalSolutions > 0 ? (count / totalSolutions) * 100 : 0
      }));

      // Distribuição por dificuldade
      const difficultyGroups = solutions.reduce((acc, solution) => {
        const difficulty = solution.difficulty || 'Sem dificuldade';
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const difficultyDistribution = Object.entries(difficultyGroups).map(([difficulty, count]) => ({
        difficulty,
        count,
        percentage: totalSolutions > 0 ? (count / totalSolutions) * 100 : 0
      }));

      // Soluções mais populares (com implementações)
      const popularSolutions = solutions
        .map(solution => {
          const implementations = solution.user_solutions?.length || 0;
          const completed = solution.user_solutions?.filter(impl => impl.is_completed).length || 0;
          const completionRate = implementations > 0 ? (completed / implementations) * 100 : 0;
          
          return {
            name: solution.title,
            implementations,
            completionRate
          };
        })
        .filter(s => s.implementations > 0)
        .sort((a, b) => b.implementations - a.implementations)
        .slice(0, 10);

      // Taxa de conclusão por solução
      const completionRates = solutions
        .map(solution => {
          const implementations = solution.user_solutions?.length || 0;
          const completed = solution.user_solutions?.filter(impl => impl.is_completed).length || 0;
          const completionRate = implementations > 0 ? (completed / implementations) * 100 : 0;
          
          return {
            solutionName: solution.title,
            completionRate
          };
        })
        .filter(s => s.completionRate > 0)
        .sort((a, b) => b.completionRate - a.completionRate)
        .slice(0, 10);

      setData({
        totalSolutions,
        publishedSolutions,
        totalImplementations,
        averageCompletionRate,
        categoryDistribution,
        popularSolutions,
        completionRates,
        difficultyDistribution
      });

    } catch (error: any) {
      console.error('Erro ao carregar analytics de soluções:', error);
      toast.error('Erro ao carregar dados de analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    refresh
  };
};
