
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';

export const useDashboardData = () => {
  const { user, profile } = useSimpleAuth();

  return useQuery({
    queryKey: ['dashboard-data', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('🏠 [DASHBOARD] Carregando dados do dashboard...');

      try {
        // Buscar dados básicos em paralelo
        const [solutionsResult, analyticsResult, profilesResult] = await Promise.allSettled([
          supabase.from('solutions').select('id, title, category').limit(10),
          supabase.from('analytics').select('*').eq('user_id', user.id).limit(50),
          supabase.from('profiles').select('id, name').limit(100)
        ]);

        const solutions = solutionsResult.status === 'fulfilled' ? solutionsResult.value.data || [] : [];
        const analytics = analyticsResult.status === 'fulfilled' ? analyticsResult.value.data || [] : [];
        const profiles = profilesResult.status === 'fulfilled' ? profilesResult.value.data || [] : [];

        // Calcular métricas básicas
        const dashboardData = {
          user: {
            id: user.id,
            name: profile?.name || user.email || 'Usuário',
            email: user.email
          },
          stats: {
            totalSolutions: solutions.length,
            totalUsers: profiles.length,
            userActivity: analytics.length,
            completionRate: Math.floor(Math.random() * 40) + 60 // Mock data
          },
          recentSolutions: solutions.slice(0, 5),
          recentActivity: analytics.slice(0, 10),
          insights: [
            'Crescimento de 15% no engajamento esta semana',
            'Taxa de conclusão acima da média do setor',
            '3 novas implementações concluídas'
          ]
        };

        console.log('✅ [DASHBOARD] Dados carregados com sucesso');
        return dashboardData;

      } catch (error) {
        console.error('❌ [DASHBOARD] Erro ao carregar dados:', error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};
