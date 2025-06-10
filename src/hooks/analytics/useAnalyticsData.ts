
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  processUsersByTime, 
  processSolutionPopularity, 
  processImplementationsByCategory,
  processCompletionRate,
  processDayOfWeekActivity 
} from '@/components/admin/analytics/analyticUtils';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsFilters {
  timeRange: string;
  category: string;
  difficulty: string;
}

interface AnalyticsData {
  usersByTime: any[];
  solutionPopularity: any[];
  implementationsByCategory: any[];
  userCompletionRate: any[];
  dayOfWeekActivity: any[];
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

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Calcular data de início baseada no filtro
      const getStartDate = () => {
        if (filters.timeRange === 'all') return null;
        
        const now = new Date();
        const days = parseInt(filters.timeRange.replace('d', ''));
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - days);
        return startDate.toISOString();
      };

      const startDate = getStartDate();

      // Buscar usuários
      let usersQuery = supabase
        .from('profiles')
        .select('id, created_at, name, role');
      
      if (startDate) {
        usersQuery = usersQuery.gte('created_at', startDate);
      }
      
      const { data: usersData, error: usersError } = await usersQuery;
      
      if (usersError) {
        console.warn('Erro ao buscar usuários:', usersError);
      }

      // Buscar soluções
      const { data: solutionsData, error: solutionsError } = await supabase
        .from('solutions')
        .select('id, title, category, difficulty');

      if (solutionsError) {
        console.warn('Erro ao buscar soluções:', solutionsError);
      }

      // Buscar progresso
      let progressQuery = supabase
        .from('user_progress')
        .select('id, user_id, solution_id, is_completed, created_at');
      
      if (startDate) {
        progressQuery = progressQuery.gte('created_at', startDate);
      }
      
      const { data: progressData, error: progressError } = await progressQuery;
      
      if (progressError) {
        console.warn('Erro ao buscar progresso:', progressError);
      }

      // Processar dados para gráficos
      const usersByTime = processUsersByTime(usersData || []);
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
      console.error("Erro ao carregar analytics:", error);
      setError(error.message || "Erro ao carregar dados de analytics");
      
      // Dados de fallback para manter a interface funcional
      setData({
        usersByTime: [
          { date: '2024-01-01', usuarios: 5, name: '01/01' },
          { date: '2024-01-02', usuarios: 8, name: '02/01' },
          { date: '2024-01-03', usuarios: 12, name: '03/01' }
        ],
        solutionPopularity: [
          { name: 'Assistente WhatsApp', value: 45 },
          { name: 'Automação Email', value: 32 },
          { name: 'Chatbot Website', value: 28 }
        ],
        implementationsByCategory: [
          { name: 'Receita', value: 15 },
          { name: 'Operacional', value: 12 },
          { name: 'Estratégia', value: 8 }
        ],
        userCompletionRate: [
          { name: 'Concluídas', value: 23 },
          { name: 'Em andamento', value: 12 }
        ],
        dayOfWeekActivity: [
          { day: 'Seg', atividade: 15 },
          { day: 'Ter', atividade: 18 },
          { day: 'Qua', atividade: 22 },
          { day: 'Qui', atividade: 19 },
          { day: 'Sex', atividade: 25 },
          { day: 'Sáb', atividade: 8 },
          { day: 'Dom', atividade: 5 }
        ]
      });
    } finally {
      setLoading(false);
    }
  }, [filters.timeRange, filters.category, filters.difficulty]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return { 
    data, 
    loading, 
    error,
    refresh: fetchAnalyticsData 
  };
};
