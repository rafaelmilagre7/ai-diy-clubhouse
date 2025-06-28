
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AutoRecommendation {
  id: string;
  type: 'user_engagement' | 'content_optimization' | 'feature_suggestion';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  data: any;
  impact?: 'high' | 'medium' | 'low';
  effort?: 'high' | 'medium' | 'low';
  metrics?: {
    current: number;
    target: number;
    unit: string;
    improvement: string;
  };
  actionItems?: string[];
}

export const useAutoRecommendations = () => {
  return useQuery({
    queryKey: ['auto-recommendations'],
    queryFn: async (): Promise<AutoRecommendation[]> => {
      console.log('🤖 [AUTO-RECOMMENDATIONS] Gerando recomendações automáticas...');

      try {
        // Buscar dados básicos 
        const [profilesResult, solutionsResult, analyticsResult] = await Promise.allSettled([
          supabase.from('profiles').select('id, created_at').limit(100),
          supabase.from('solutions').select('id, title, category, published').limit(50),
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
              impact: 'high',
              effort: 'medium',
              metrics: {
                current: recentUsers.length,
                target: Math.round(profiles.length * 0.2),
                unit: 'usuários',
                improvement: '100%'
              },
              actionItems: [
                'Implementar campanha de email marketing',
                'Melhorar processo de onboarding',
                'Criar conteúdo atrativo para novos usuários'
              ],
              data: { recentUsers: recentUsers.length, totalUsers: profiles.length }
            });
          }
        }

        // Recomendação 2: Otimização de conteúdo
        if (solutions.length > 0) {
          const publishedSolutions = solutions.filter(s => s.published === true);
          const unpublishedCount = solutions.length - publishedSolutions.length;
          
          if (unpublishedCount > 0) {
            recommendations.push({
              id: 'content-optimization',
              type: 'content_optimization',
              title: 'Muitas soluções não publicadas',
              description: `${unpublishedCount} soluções aguardando publicação. Isso pode limitar o valor para os usuários.`,
              priority: 'medium',
              confidence: 0.75,
              actionable: true,
              impact: 'medium',
              effort: 'low',
              metrics: {
                current: publishedSolutions.length,
                target: solutions.length,
                unit: 'soluções',
                improvement: `${Math.round((unpublishedCount / solutions.length) * 100)}%`
              },
              actionItems: [
                'Revisar e publicar soluções pendentes',
                'Definir processo de aprovação mais eficiente',
                'Criar checklist de qualidade'
              ],
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
              impact: 'medium',
              effort: 'medium',
              metrics: {
                current: recentActivity.length,
                target: 25,
                unit: 'eventos',
                improvement: '150%'
              },
              actionItems: [
                'Implementar sistema de notificações',
                'Criar conteúdo mais engajante',
                'Melhorar UX da plataforma'
              ],
              data: { recentEvents: recentActivity.length }
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
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};
