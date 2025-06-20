
import { useState, useEffect, useCallback, useMemo } from 'react';
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

// Cache simples para evitar re-fetches desnecessários
const analyticsCache = new Map<string, { data: AnalyticsData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

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

  // Gerar chave de cache baseada nos filtros
  const cacheKey = useMemo(() => 
    `${filters.timeRange}-${filters.category}-${filters.difficulty}`, 
    [filters]
  );

  const fetchAnalyticsData = useCallback(async () => {
    try {
      // Verificar cache primeiro
      const cached = analyticsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setData(cached.data);
        setLoading(false);
        return;
      }

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

      // Buscar dados em paralelo para melhor performance
      const [usersResult, solutionsResult, progressResult] = await Promise.allSettled([
        // Usuários
        supabase
          .from('profiles')
          .select('id, created_at, name, role')
          .then(result => startDate ? 
            supabase.from('profiles').select('id, created_at, name, role').gte('created_at', startDate) :
            result
          ),
        
        // Soluções
        supabase
          .from('solutions')
          .select('id, title, category, difficulty')
          .then(result => {
            let query = supabase.from('solutions').select('id, title, category, difficulty');
            if (filters.category !== 'all') {
              query = query.eq('category', filters.category as any);
            }
            if (filters.difficulty !== 'all') {
              query = query.eq('difficulty', filters.difficulty as any);
            }
            return filters.category === 'all' && filters.difficulty === 'all' ? result : query;
          }),
        
        // Progresso
        supabase
          .from('user_progress')
          .select('id, user_id, solution_id, is_completed, created_at')
          .then(result => startDate ?
            supabase.from('user_progress').select('id, user_id, solution_id, is_completed, created_at').gte('created_at', startDate) :
            result
          )
      ]);

      // Processar resultados
      const usersData = usersResult.status === 'fulfilled' ? (usersResult.value.data as any) || [] : [];
      const solutionsData = solutionsResult.status === 'fulfilled' ? (solutionsResult.value.data as any) || [] : [];
      const progressData = progressResult.status === 'fulfilled' ? (progressResult.value.data as any) || [] : [];

      // Log warnings para erros não críticos
      if (usersResult.status === 'rejected') {
        console.warn('Erro ao buscar usuários:', usersResult.reason);
      }
      if (solutionsResult.status === 'rejected') {
        console.warn('Erro ao buscar soluções:', solutionsResult.reason);
      }
      if (progressResult.status === 'rejected') {
        console.warn('Erro ao buscar progresso:', progressResult.reason);
      }

      // Processar dados para gráficos
      const processedData: AnalyticsData = {
        usersByTime: processUsersByTime(usersData),
        solutionPopularity: processSolutionPopularity(progressData, solutionsData),
        implementationsByCategory: processImplementationsByCategory(progressData, solutionsData),
        userCompletionRate: processCompletionRate(progressData),
        dayOfWeekActivity: processDayOfWeekActivity(progressData)
      };

      // Armazenar no cache
      analyticsCache.set(cacheKey, {
        data: processedData,
        timestamp: Date.now()
      });

      setData(processedData);

    } catch (error: any) {
      console.error("Erro ao carregar analytics:", error);
      setError(error.message || "Erro ao carregar dados de analytics");
      
      // Dados de fallback mais realistas
      const fallbackData: AnalyticsData = {
        usersByTime: [
          { date: '2024-01-01', usuarios: 5, name: '01/01', total: 5, novos: 5 },
          { date: '2024-01-02', usuarios: 8, name: '02/01', total: 13, novos: 8 },
          { date: '2024-01-03', usuarios: 12, name: '03/01', total: 25, novos: 12 }
        ],
        solutionPopularity: [
          { name: 'Assistente WhatsApp', value: 45 },
          { name: 'Automação Email', value: 32 },
          { name: 'Chatbot Website', value: 28 },
          { name: 'CRM Integração', value: 22 },
          { name: 'Analytics Dashboard', value: 18 }
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
      };
      
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [filters.timeRange, filters.category, filters.difficulty, cacheKey]);

  // Função para limpar cache manualmente
  const clearCache = useCallback(() => {
    analyticsCache.clear();
  }, []);

  // Função para refresh que limpa cache
  const refresh = useCallback(() => {
    analyticsCache.delete(cacheKey);
    fetchAnalyticsData();
  }, [cacheKey, fetchAnalyticsData]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return { 
    data, 
    loading, 
    error,
    refresh,
    clearCache
  };
};
