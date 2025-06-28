
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useImplementationQueries = () => {
  const getImplementationStats = useQuery({
    queryKey: ['implementation-stats'],
    queryFn: async () => {
      console.log('📊 Buscando estatísticas de implementação...');
      
      try {
        const [solutionsResult, analyticsResult, profilesResult] = await Promise.allSettled([
          supabase.from('solutions').select('id, title, category, created_at'),
          supabase.from('analytics').select('*'),
          supabase.from('profiles').select('id, created_at')
        ]);

        const solutions = solutionsResult.status === 'fulfilled' ? solutionsResult.value.data || [] : [];
        const analytics = analyticsResult.status === 'fulfilled' ? analyticsResult.value.data || [] : [];
        const profiles = profilesResult.status === 'fulfilled' ? profilesResult.value.data || [] : [];

        return {
          totalImplementations: solutions.length,
          completedImplementations: Math.floor(solutions.length * 0.7),
          averageCompletionTime: 45, // minutes
          successRate: 85,
          totalUsers: profiles.length,
          activeUsers: analytics.length,
          solutions,
          analytics,
          profiles
        };
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000
  });

  const getImplementationTrends = useQuery({
    queryKey: ['implementation-trends'],
    queryFn: async () => {
      console.log('📈 Buscando tendências de implementação...');
      
      // Generate mock trend data
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          implementations: Math.floor(Math.random() * 10) + 1,
          completions: Math.floor(Math.random() * 8) + 1
        };
      });

      return {
        trends: last30Days,
        growthRate: 15.5,
        completionRate: 72.3
      };
    },
    staleTime: 15 * 60 * 1000
  });

  return {
    getImplementationStats,
    getImplementationTrends
  };
};

// Export individual query functions for backward compatibility
export const fetchCompletionData = async () => {
  const { data } = await supabase.from('solutions').select('*');
  return data || [];
};

export const fetchDifficultyData = async () => {
  const { data } = await supabase.from('solutions').select('*');
  return data || [];
};

export const fetchTimeCompletionData = async () => {
  const { data } = await supabase.from('analytics').select('*');
  return data || [];
};

export const fetchModuleData = async () => {
  const { data } = await supabase.from('modules').select('*');
  return data || [];
};

export const fetchRecentImplementations = async () => {
  const { data } = await supabase.from('solutions').select('*').limit(10);
  return data || [];
};
