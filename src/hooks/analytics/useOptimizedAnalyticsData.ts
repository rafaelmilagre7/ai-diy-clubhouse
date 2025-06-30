
import { useQuery } from '@tanstack/react-query';
import { useOptimizedAnalyticsCache } from './useOptimizedAnalyticsCache';
import { useDebouncedFilters } from './useDebouncedFilters';
import { supabase } from '@/lib/supabase';
import { useCallback, useMemo } from 'react';

interface OptimizedAnalyticsFilters {
  timeRange: string;
  category: string;
  difficulty: string;
}

interface AnalyticsQueryOptions {
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  enabled?: boolean;
}

export const useOptimizedAnalyticsData = (
  initialFilters: OptimizedAnalyticsFilters,
  options: AnalyticsQueryOptions = {}
) => {
  const {
    staleTime = 5 * 60 * 1000, // 5 minutos
    cacheTime = 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus = false,
    enabled = true
  } = options;

  const { getCachedData, setCachedData, hasCache } = useOptimizedAnalyticsCache();
  
  // Usar filtros debounced para evitar muitas requests
  const { debouncedFilters, filterHash, isDebouncing } = useDebouncedFilters(initialFilters, {
    delay: 500 // Delay maior para analytics
  });

  // Query key otimizada
  const queryKey = useMemo(() => [
    'optimized-analytics-data',
    filterHash
  ], [filterHash]);

  // Função de fetch otimizada
  const fetchAnalyticsData = useCallback(async () => {
    const cacheKey = `analytics-${filterHash}`;
    
    // Verificar cache primeiro
    const cached = getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    console.log('🔄 Fetching analytics data with filters:', debouncedFilters);

    // Calcular data de início
    const getStartDate = () => {
      if (debouncedFilters.timeRange === 'all') return null;
      
      const now = new Date();
      const days = parseInt(debouncedFilters.timeRange.replace('d', ''));
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - days);
      return startDate.toISOString();
    };

    const startDate = getStartDate();

    try {
      // Buscar dados em paralelo com otimizações
      const [usersPromise, solutionsPromise, progressPromise] = await Promise.allSettled([
        // Usuários com filtro de data otimizado
        supabase
          .from('profiles')
          .select('id, created_at, name, role')
          .then(result => {
            if (startDate) {
              return supabase
                .from('profiles')
                .select('id, created_at, name, role')
                .gte('created_at', startDate)
                .order('created_at', { ascending: false })
                .limit(1000); // Limitar resultados para performance
            }
            return result;
          }),

        // Soluções com filtros aplicados
        (() => {
          let query = supabase
            .from('solutions')
            .select('id, title, category, difficulty, created_at');
          
          if (debouncedFilters.category !== 'all') {
            query = query.eq('category', debouncedFilters.category);
          }
          if (debouncedFilters.difficulty !== 'all') {
            query = query.eq('difficulty', debouncedFilters.difficulty);
          }
          
          return query.limit(500); // Limitar para performance
        })(),

        // Progresso com otimizações
        supabase
          .from('user_progress')
          .select('id, user_id, solution_id, is_completed, created_at')
          .then(result => {
            if (startDate) {
              return supabase
                .from('user_progress')
                .select('id, user_id, solution_id, is_completed, created_at')
                .gte('created_at', startDate)
                .order('created_at', { ascending: false })
                .limit(2000); // Limitar para performance
            }
            return result;
          })
      ]);

      // Processar resultados de forma otimizada
      const usersData = usersPromise.status === 'fulfilled' ? usersPromise.value.data || [] : [];
      const solutionsData = solutionsPromise.status === 'fulfilled' ? solutionsPromise.value.data || [] : [];
      const progressData = progressPromise.status === 'fulfilled' ? progressPromise.value.data || [] : [];

      // Processar dados com algoritmos otimizados
      const processedData = {
        usersByTime: processUsersByTimeOptimized(usersData),
        solutionPopularity: processSolutionPopularityOptimized(progressData, solutionsData),
        implementationsByCategory: processImplementationsByCategoryOptimized(progressData, solutionsData),
        userCompletionRate: processCompletionRateOptimized(progressData),
        dayOfWeekActivity: processDayOfWeekActivityOptimized(progressData),
        // Métricas de performance
        _meta: {
          dataPoints: {
            users: usersData.length,
            solutions: solutionsData.length,
            progress: progressData.length
          },
          filters: debouncedFilters,
          generatedAt: new Date().toISOString()
        }
      };

      // Cachear resultado
      setCachedData(cacheKey, processedData, staleTime);

      return processedData;

    } catch (error) {
      console.error('❌ Erro ao buscar analytics otimizado:', error);
      throw error;
    }
  }, [debouncedFilters, filterHash, getCachedData, setCachedData, staleTime]);

  // Query React Query otimizada
  const query = useQuery({
    queryKey,
    queryFn: fetchAnalyticsData,
    staleTime,
    gcTime: cacheTime,
    enabled: enabled && !isDebouncing,
    refetchOnWindowFocus,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    ...query,
    filters: debouncedFilters,
    isDebouncing,
    hasCache: hasCache(`analytics-${filterHash}`),
    // Métricas de performance
    performanceInfo: query.data?._meta
  };
};

// Funções de processamento otimizadas
function processUsersByTimeOptimized(users: any[]) {
  const usersByDate = new Map();
  
  users.forEach(user => {
    const date = new Date(user.created_at).toISOString().split('T')[0];
    usersByDate.set(date, (usersByDate.get(date) || 0) + 1);
  });

  return Array.from(usersByDate.entries()).map(([date, count]) => ({
    date,
    usuarios: count,
    name: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    total: count,
    novos: count
  }));
}

function processSolutionPopularityOptimized(progress: any[], solutions: any[]) {
  const solutionMap = new Map(solutions.map(s => [s.id, s.title]));
  const popularity = new Map();

  progress.forEach(p => {
    const title = solutionMap.get(p.solution_id);
    if (title) {
      popularity.set(title, (popularity.get(title) || 0) + 1);
    }
  });

  return Array.from(popularity.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10
}

function processImplementationsByCategoryOptimized(progress: any[], solutions: any[]) {
  const solutionCategories = new Map(solutions.map(s => [s.id, s.category]));
  const categoryCount = new Map();

  progress.forEach(p => {
    const category = solutionCategories.get(p.solution_id);
    if (category) {
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    }
  });

  return Array.from(categoryCount.entries()).map(([name, value]) => ({ name, value }));
}

function processCompletionRateOptimized(progress: any[]) {
  const completed = progress.filter(p => p.is_completed).length;
  const inProgress = progress.length - completed;

  return [
    { name: 'Concluídas', value: completed },
    { name: 'Em andamento', value: inProgress }
  ];
}

function processDayOfWeekActivityOptimized(progress: any[]) {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const activityByDay = new Array(7).fill(0);

  progress.forEach(p => {
    const dayIndex = new Date(p.created_at).getDay();
    activityByDay[dayIndex]++;
  });

  return days.map((day, index) => ({
    day,
    atividade: activityByDay[index]
  }));
}
