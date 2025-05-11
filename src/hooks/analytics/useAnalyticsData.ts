
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  processUsersByTime, 
  processSolutionPopularity, 
  processImplementationsByCategory,
  processCompletionRate,
  processDayOfWeekActivity
} from '@/components/admin/analytics/analyticUtils';

interface AnalyticsData {
  usersByTime: any[];
  solutionPopularity: any[];
  implementationsByCategory: any[];
  userCompletionRate: any[];
  dayOfWeekActivity: any[];
}

interface AnalyticsFilters {
  timeRange: string;
  category: string;
  difficulty: string;
}

export const useAnalyticsData = (filters: AnalyticsFilters) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData>({
    usersByTime: [],
    solutionPopularity: [],
    implementationsByCategory: [],
    userCompletionRate: [],
    dayOfWeekActivity: []
  });

  // Função para buscar dados, exposta para permitir refresh manual
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Calcular a data de início com base no timeRange
      const getStartDate = () => {
        if (filters.timeRange === 'all') return null;
        
        const now = new Date();
        const days = parseInt(filters.timeRange);
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - days);
        return startDate.toISOString();
      };

      const startDate = getStartDate();

      console.log('Buscando dados de analytics com filtros:', { 
        startDate, 
        category: filters.category, 
        difficulty: filters.difficulty 
      });

      // Buscar dados de usuários com filtro de tempo
      let userQuery = supabase
        .from('profiles')
        .select('created_at');
      
      if (startDate) {
        userQuery = userQuery.gte('created_at', startDate);
      }
      
      const { data: userData, error: userError } = await userQuery;
      
      if (userError) throw userError;

      // Buscar dados de soluções com filtros
      let solutionsQuery = supabase
        .from('solutions')
        .select('id, title, category, difficulty');
      
      if (filters.category !== 'all') {
        solutionsQuery = solutionsQuery.eq('category', filters.category);
      }
      
      if (filters.difficulty !== 'all') {
        solutionsQuery = solutionsQuery.eq('difficulty', filters.difficulty);
      }
      
      const { data: solutionsData, error: solutionsError } = await solutionsQuery;
      
      if (solutionsError) throw solutionsError;

      // IDs das soluções filtradas para usar na consulta de progresso
      const filteredSolutionIds = solutionsData?.map(s => s.id) || [];

      // Buscar dados de progresso com filtros
      let progressQuery = supabase
        .from('progress')
        .select('solution_id, is_completed, created_at');
      
      if (startDate) {
        progressQuery = progressQuery.gte('created_at', startDate);
      }
      
      if (filteredSolutionIds.length > 0 && (filters.category !== 'all' || filters.difficulty !== 'all')) {
        progressQuery = progressQuery.in('solution_id', filteredSolutionIds);
      }
      
      const { data: progressData, error: progressError } = await progressQuery;
      
      if (progressError) throw progressError;

      console.log('Dados recebidos:', { 
        users: userData?.length || 0, 
        solutions: solutionsData?.length || 0, 
        progress: progressData?.length || 0 
      });

      // Processar dados para gráficos
      const usersByTime = processUsersByTime(userData || []);
      const solutionPopularity = processSolutionPopularity(progressData || [], solutionsData || []);
      const implementationsByCategory = processImplementationsByCategory(progressData || [], solutionsData || []);
      const userCompletionRate = processCompletionRate(progressData || []);
      const dayOfWeekActivity = processDayOfWeekActivity(progressData || []);

      setData({
        usersByTime,
        solutionPopularity,
        implementationsByCategory,
        userCompletionRate,
        dayOfWeekActivity
      });

    } catch (error: any) {
      console.error("Erro ao carregar dados de análise:", error);
      setError(error.message || "Erro ao carregar dados de análise");
      toast({
        title: "Erro ao carregar análises",
        description: "Não foi possível carregar os dados de análise.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.difficulty, filters.timeRange, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    data, 
    loading, 
    error,
    refresh: fetchData 
  };
};
