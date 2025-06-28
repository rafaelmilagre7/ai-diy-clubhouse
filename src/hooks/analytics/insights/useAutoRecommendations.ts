
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AutoRecommendation {
  id: string;
  type: 'user_engagement' | 'content_optimization' | 'feature_suggestion';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  data: any;
}

export const useAutoRecommendations = () => {
  return useQuery({
    queryKey: ['auto-recommendations'],
    queryFn: async (): Promise<AutoRecommendation[]> => {
      console.log('🤖 [AUTO-RECOMMENDATIONS] Gerando recomendações automáticas...');

      try {
        // Buscar dados básicos para gerar recomendações
        const [profilesResult, solutionsResult, analyticsResult] = await Promise.allSettled([
          supabase.from('profiles').select('id, created_at').limit(100),
          supabase.from('solutions').select('id, title, category, is_published').limit(50),
          supabase.from('analytics').select('*').limit(100)
        ]);

        const profiles = profilesResult.status === 'fulfilled' ? profilesResult.value.data || [] : [];
        const solutions = solutionsResult.status === 'fulfilled' ? solutionsResult.value.data || [] : [];
        const analytics = analyticsResult.status === 'fulfilled' ? analyticsResult.value.data || [] : [];

        const recommendations: AutoRecommendation[] = [];

        // Recomendação 1: Engajamento de usuários
        if (profiles.length > 0) {
          const recentUsers = profiles.filter(p => 
            new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          );
          
          if (recentUsers.length < profiles.length * 0.1) {
            recommendations.push({
              id: 'user-engagement-low',
              type: 'user_engagement',
              title: 'Baixo engajamento de novos usuários',
              description: `Apenas ${recentUsers.length} novos usuários na última semana. Considere campanhas de marketing ou melhoria do onboarding.`,
              priority: 'high',
              confidence: 0.85,
              actionable: true,
              data: { recentUsers: recentUsers.length, totalUsers: profiles.length }
            });
          }
        }

        // Recomendação 2: Otimização de conteúdo
        if (solutions.length > 0) {
          const publishedSolutions = solutions.filter(s => s.is_published === true);
          const unpublishedCount = solutions.length - publishedSolutions.length;
          
          if (unpublishedCount > publishedSolutions.length * 0.3) {
            recommendations.push({
              id: 'content-optimization',
              type: 'content_optimization',
              title: 'Muitas soluções não publicadas',
              description: `${unpublishedCount} soluções aguardando publicação. Isso pode limitar o valor para os usuários.`,
              priority: 'medium',
              confidence: 0.75,
              actionable: true,
              data: { unpublished: unpublishedCount, published: publishedSolutions.length }
            });
          }
        }

        // Recomendação 3: Análise de atividade
        if (analytics.length > 0) {
          const recentActivity = analytics.filter(a => 
            new Date(a.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          );
          
          if (recentActivity.length < 10) {
            recommendations.push({
              id: 'activity-low',
              type: 'user_engagement',
              title: 'Baixa atividade recente',
              description: `Apenas ${recentActivity.length} eventos nas últimas 24h. Considere notificações ou novos recursos.`,
              priority: 'medium',
              confidence: 0.70,
              actionable: true,
              data: { recentEvents: recentActivity.length }
            });
          }
        }

        // Recomendação 4: Distribuição de categorias
        const categoryDistribution = solutions.reduce((acc, solution) => {
          acc[solution.category] = (acc[solution.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const categories = Object.keys(categoryDistribution);
        if (categories.length > 0) {
          const maxCategory = categories.reduce((a, b) => 
            categoryDistribution[a] > categoryDistribution[b] ? a : b
          );
          
          if (categoryDistribution[maxCategory] > solutions.length * 0.6) {
            recommendations.push({
              id: 'category-balance',
              type: 'content_optimization',
              title: 'Desequilíbrio nas categorias de soluções',
              description: `A categoria "${maxCategory}" representa ${Math.round((categoryDistribution[maxCategory] / solutions.length) * 100)}% das soluções. Considere diversificar o conteúdo.`,
              priority: 'low',
              confidence: 0.65,
              actionable: true,
              data: { distribution: categoryDistribution }
            });
          }
        }

        console.log(`✅ [AUTO-RECOMMENDATIONS] ${recommendations.length} recomendações geradas`);
        return recommendations;

      } catch (error) {
        console.error('❌ [AUTO-RECOMMENDATIONS] Erro ao gerar recomendações:', error);
        return [];
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false
  });
};
