
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLogging } from '@/hooks/useLogging';
import { useDataValidation } from '../useDataValidation';

interface Recommendation {
  id: string;
  type: 'performance' | 'engagement' | 'content' | 'user_experience';
  title: string;
  description: string;
  priority: number;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  metrics: {
    current: number;
    target: number;
    unit: string;
  };
  actionItems: string[];
}

export const useAutoRecommendations = (timeRange: string) => {
  const { log, logWarning } = useLogging();
  const { sanitizeNumericValue, sanitizePercentage } = useDataValidation();

  return useQuery({
    queryKey: ['auto-recommendations', timeRange],
    queryFn: async (): Promise<Recommendation[]> => {
      try {
        log('Gerando recomendações automáticas', { timeRange });

        // Calcular período
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        // Buscar dados para análise
        const [
          { data: users },
          { data: implementations },
          { data: analytics },
          { data: solutions }
        ] = await Promise.all([
          supabase.from('profiles').select('id, created_at').gte('created_at', startDate.toISOString()),
          supabase.from('progress').select('*').gte('created_at', startDate.toISOString()),
          supabase.from('analytics').select('*').gte('created_at', startDate.toISOString()),
          supabase.from('solutions').select('id, is_published')
        ]);

        const recommendations: Recommendation[] = [];

        // Analisar taxa de conclusão
        const totalImplementations = sanitizeNumericValue(implementations?.length, 0);
        const completedImplementations = sanitizeNumericValue(
          implementations?.filter(i => i.is_completed).length, 0
        );
        const completionRate = totalImplementations > 0 
          ? (completedImplementations / totalImplementations) * 100 
          : 0;

        if (completionRate < 60) {
          recommendations.push({
            id: 'improve-completion-rate',
            type: 'performance',
            title: 'Melhorar Taxa de Conclusão',
            description: 'A taxa de conclusão está abaixo do ideal. Considere simplificar os módulos iniciais.',
            priority: 85,
            impact: 'high',
            effort: 'medium',
            metrics: {
              current: completionRate,
              target: 75,
              unit: '%'
            },
            actionItems: [
              'Revisar complexidade dos primeiros módulos',
              'Adicionar mais checkpoints intermediários',
              'Implementar sistema de lembretes automáticos'
            ]
          });
        }

        // Analisar engajamento de usuários
        const totalUsers = sanitizeNumericValue(users?.length, 0);
        const activeUsers = new Set(analytics?.map(a => a.user_id) || []).size;
        const engagementRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

        if (engagementRate < 40) {
          recommendations.push({
            id: 'increase-engagement',
            type: 'engagement',
            title: 'Aumentar Engajamento',
            description: 'Muitos usuários não estão interagindo ativamente. Implemente estratégias de reengajamento.',
            priority: 75,
            impact: 'high',
            effort: 'medium',
            metrics: {
              current: engagementRate,
              target: 55,
              unit: '%'
            },
            actionItems: [
              'Criar programa de onboarding interativo',
              'Enviar newsletters com dicas semanais',
              'Implementar gamificação'
            ]
          });
        }

        // Analisar conteúdo
        const publishedSolutions = sanitizeNumericValue(
          solutions?.filter(s => s.is_published).length, 0
        );
        const totalSolutions = sanitizeNumericValue(solutions?.length, 0);

        if (publishedSolutions < 5) {
          recommendations.push({
            id: 'expand-content',
            type: 'content',
            title: 'Expandir Biblioteca de Conteúdo',
            description: 'Poucos conteúdos publicados limitam as opções dos usuários.',
            priority: 60,
            impact: 'medium',
            effort: 'high',
            metrics: {
              current: publishedSolutions,
              target: 15,
              unit: ' soluções'
            },
            actionItems: [
              'Priorizar publicação de soluções em rascunho',
              'Criar calendário editorial',
              'Envolver especialistas externos'
            ]
          });
        }

        // Analisar experiência do usuário
        const avgSessionTime = analytics?.length > 0 ? 25 : 0; // Simulado
        
        if (avgSessionTime < 20) {
          recommendations.push({
            id: 'improve-ux',
            type: 'user_experience',
            title: 'Melhorar Experiência do Usuário',
            description: 'Tempo de sessão baixo indica possíveis problemas de usabilidade.',
            priority: 70,
            impact: 'medium',
            effort: 'low',
            metrics: {
              current: avgSessionTime,
              target: 35,
              unit: ' min'
            },
            actionItems: [
              'Otimizar navegação principal',
              'Melhorar velocidade de carregamento',
              'Simplificar fluxos críticos'
            ]
          });
        }

        // Ordenar por prioridade
        recommendations.sort((a, b) => b.priority - a.priority);

        log('Recomendações geradas', { 
          count: recommendations.length,
          timeRange 
        });

        return recommendations;

      } catch (error: any) {
        logWarning('Erro ao gerar recomendações automáticas', { 
          error: error.message,
          timeRange
        });
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (recomendações não mudam tão frequentemente)
    refetchOnWindowFocus: false
  });
};
