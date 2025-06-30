
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface SolutionAnalyticsData {
  totalSolutions: number;
  publishedSolutions: number;
  totalImplementations: number;
  averageCompletionRate: number;
  solutionsByCategory: Array<{
    name: string;
    value: number;
  }>;
  solutionsByDifficulty: Array<{
    name: string;
    value: number;
  }>;
  topSolutions: Array<{
    title: string;
    category: string;
    implementations: number;
    completionRate: number;
  }>;
}

export const useSolutionAnalyticsData = (timeRange: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SolutionAnalyticsData>({
    totalSolutions: 0,
    publishedSolutions: 0,
    totalImplementations: 0,
    averageCompletionRate: 0,
    solutionsByCategory: [],
    solutionsByDifficulty: [],
    topSolutions: []
  });

  useEffect(() => {
    const fetchSolutionAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar métricas de performance das soluções da nova view
        const { data: performanceData, error: performanceError } = await supabase
          .from('solution_performance_metrics')
          .select('*')
          .order('total_implementations', { ascending: false });

        if (performanceError) {
          console.warn('Erro ao buscar performance de soluções:', performanceError);
        }

        // Buscar contagem total de soluções
        const { count: totalSolutions, error: countError } = await supabase
          .from('solutions')
          .select('*', { count: 'exact', head: true });

        const { count: publishedSolutions, error: publishedError } = await supabase
          .from('solutions')
          .select('*', { count: 'exact', head: true })
          .eq('published', true);

        if (countError || publishedError) {
          console.warn('Erro ao buscar contagens:', countError || publishedError);
        }

        // Processar dados
        const totalImplementations = performanceData?.reduce((sum, item) => sum + item.total_implementations, 0) || 0;
        const avgCompletionRate = performanceData?.length > 0 
          ? Math.round(performanceData.reduce((sum, item) => sum + item.completion_rate, 0) / performanceData.length)
          : 0;

        // Agrupar por categoria
        const categoryMap = new Map();
        performanceData?.forEach(item => {
          const category = item.category || 'Outros';
          categoryMap.set(category, (categoryMap.get(category) || 0) + item.total_implementations);
        });

        // Agrupar por dificuldade
        const difficultyMap = new Map();
        performanceData?.forEach(item => {
          const difficulty = item.difficulty || 'não definida';
          const difficultyName = difficulty === 'beginner' ? 'Iniciante' :
                                difficulty === 'intermediate' ? 'Intermediário' :
                                difficulty === 'advanced' ? 'Avançado' : 'Não definida';
          difficultyMap.set(difficultyName, (difficultyMap.get(difficultyName) || 0) + 1);
        });

        const processedData: SolutionAnalyticsData = {
          totalSolutions: totalSolutions || 0,
          publishedSolutions: publishedSolutions || 0,
          totalImplementations,
          averageCompletionRate: avgCompletionRate,
          solutionsByCategory: Array.from(categoryMap.entries()).map(([name, value]) => ({
            name,
            value
          })),
          solutionsByDifficulty: Array.from(difficultyMap.entries()).map(([name, value]) => ({
            name,
            value
          })),
          topSolutions: performanceData?.slice(0, 10).map(item => ({
            title: item.title,
            category: item.category || 'Outros',
            implementations: item.total_implementations,
            completionRate: item.completion_rate
          })) || []
        };

        setData(processedData);
        
        console.log('🎯 Dados de soluções carregados (sincronizados):', {
          totalSolutions: processedData.totalSolutions,
          totalImplementations: processedData.totalImplementations,
          avgCompletionRate: processedData.averageCompletionRate
        });

      } catch (error: any) {
        console.error('Erro ao carregar analytics de soluções:', error);
        setError(error.message || 'Erro ao carregar dados de soluções');
        toast({
          title: "Erro ao carregar dados de soluções",
          description: "Não foi possível carregar os dados. Verifique sua conexão.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSolutionAnalytics();
  }, [timeRange, toast]);

  return { data, loading, error };
};
