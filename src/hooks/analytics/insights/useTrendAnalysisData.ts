
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface TrendData {
  period: string;
  users: number;
  solutions: number;
  completions: number;
  engagement: number;
}

export interface TrendAnalysis {
  trends: TrendData[];
  insights: string[];
  predictions: string[];
}

export const useTrendAnalysisData = (period: 'week' | 'month' | 'quarter' = 'month') => {
  return useQuery({
    queryKey: ['trend-analysis', period],
    queryFn: async (): Promise<TrendAnalysis> => {
      console.log(`📈 [TREND ANALYSIS] Analisando tendências para período: ${period}`);

      try {
        // Definir intervalo baseado no período
        const now = new Date();
        const intervals = period === 'week' ? 7 : period === 'month' ? 30 : 90;
        const startDate = new Date(now.getTime() - intervals * 24 * 60 * 60 * 1000);

        // Buscar dados básicos
        const [profilesResult, solutionsResult, analyticsResult] = await Promise.allSettled([
          supabase
            .from('profiles')
            .select('id, created_at')
            .gte('created_at', startDate.toISOString()),
          supabase
            .from('solutions')
            .select('id, title, created_at'),
          supabase
            .from('analytics')
            .select('*')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: true })
        ]);

        const profiles = profilesResult.status === 'fulfilled' ? profilesResult.value.data || [] : [];
        const solutions = solutionsResult.status === 'fulfilled' ? solutionsResult.value.data || [] : [];
        const analytics = analyticsResult.status === 'fulfilled' ? analyticsResult.value.data || [] : [];

        // Gerar tendências por período
        const trends: TrendData[] = [];
        const periodDays = period === 'week' ? 1 : period === 'month' ? 7 : 30; // Agrupamento

        for (let i = 0; i < intervals; i += periodDays) {
          const periodStart = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
          const periodEnd = new Date(periodStart.getTime() + periodDays * 24 * 60 * 60 * 1000);
          
          const periodProfiles = profiles.filter(p => {
            const date = new Date(p.created_at);
            return date >= periodStart && date < periodEnd;
          });

          const periodAnalytics = analytics.filter(a => {
            const date = new Date(a.created_at);
            return date >= periodStart && date < periodEnd;
          });

          // Simular completions baseado em analytics
          const completions = periodAnalytics.filter(a => 
            a.event_type === 'solution_completed' || a.event_type === 'module_completed'
          ).length;

          trends.push({
            period: periodStart.toISOString().split('T')[0],
            users: periodProfiles.length,
            solutions: solutions.length, // Total de soluções
            completions,
            engagement: periodAnalytics.length
          });
        }

        // Gerar insights baseados nas tendências
        const insights: string[] = [];
        const predictions: string[] = [];

        if (trends.length >= 2) {
          const latest = trends[trends.length - 1];
          const previous = trends[trends.length - 2];

          // Insight sobre crescimento de usuários
          const userGrowth = ((latest.users - previous.users) / Math.max(previous.users, 1)) * 100;
          if (userGrowth > 10) {
            insights.push(`Crescimento acelerado de usuários: +${userGrowth.toFixed(1)}% no último período`);
          } else if (userGrowth < -10) {
            insights.push(`Declínio na aquisição de usuários: ${userGrowth.toFixed(1)}% no último período`);
          }

          // Insight sobre engajamento
          const engagementGrowth = ((latest.engagement - previous.engagement) / Math.max(previous.engagement, 1)) * 100;
          if (engagementGrowth > 20) {
            insights.push(`Aumento significativo no engajamento: +${engagementGrowth.toFixed(1)}%`);
          }

          // Predições baseadas na tendência
          if (userGrowth > 0) {
            predictions.push(`Tendência positiva: esperado ${Math.round(latest.users * (1 + userGrowth/100))} novos usuários no próximo período`);
          }

          if (latest.completions > previous.completions) {
            predictions.push(`Aumento na conclusão de soluções indica maior valor percebido pelos usuários`);
          }
        }

        // Insights adicionais
        const totalEngagement = trends.reduce((sum, t) => sum + t.engagement, 0);
        const avgEngagement = totalEngagement / trends.length;
        
        if (avgEngagement < 5) {
          insights.push('Engajamento geral baixo - considere melhorias na experiência do usuário');
        } else if (avgEngagement > 20) {
          insights.push('Alto nível de engajamento - usuários estão ativamente utilizando a plataforma');
        }

        const analysis: TrendAnalysis = {
          trends,
          insights,
          predictions
        };

        console.log(`✅ [TREND ANALYSIS] Análise concluída: ${trends.length} períodos, ${insights.length} insights`);
        return analysis;

      } catch (error) {
        console.error('❌ [TREND ANALYSIS] Erro na análise de tendências:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false
  });
};
