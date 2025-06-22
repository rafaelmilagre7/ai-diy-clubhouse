
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLogging } from '@/hooks/useLogging';

interface Recommendation {
  id: string;
  type: 'performance' | 'engagement' | 'content' | 'user_experience';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  priority: number;
  category: string;
  actionItems: string[];
  metrics: {
    current: number;
    target: number;
    unit: string;
  };
}

export const useAutoRecommendations = (timeRange: string) => {
  const { log, logWarning } = useLogging();

  return useQuery({
    queryKey: ['auto-recommendations', timeRange],
    queryFn: async (): Promise<Recommendation[]> => {
      try {
        log('Gerando recomendações automáticas baseadas em dados', { timeRange });

        const recommendations: Recommendation[] = [];
        
        // Calcular data de início baseada no timeRange
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

        // 1. Analisar taxa de conclusão
        const { data: progressData } = await supabase
          .from('progress')
          .select('is_completed, created_at')
          .gte('created_at', startDate.toISOString());

        if (progressData && progressData.length > 0) {
          const completionRate = (progressData.filter(p => p.is_completed).length / progressData.length) * 100;
          
          if (completionRate < 50) {
            recommendations.push({
              id: 'low-completion-rate',
              type: 'performance',
              title: 'Melhorar Taxa de Conclusão',
              description: `A taxa de conclusão atual é de ${completionRate.toFixed(1)}%, abaixo do ideal de 70%.`,
              impact: 'high',
              effort: 'medium',
              priority: 90,
              category: 'Performance',
              actionItems: [
                'Revisar conteúdo dos módulos iniciais',
                'Implementar sistema de gamificação',
                'Adicionar lembretes por email',
                'Simplificar navegação entre módulos'
              ],
              metrics: {
                current: completionRate,
                target: 70,
                unit: '%'
              }
            });
          }
        }

        // 2. Analisar atividade de usuários
        const { data: activeUsers } = await supabase
          .from('analytics')
          .select('user_id, created_at')
          .gte('created_at', startDate.toISOString());

        const uniqueActiveUsers = new Set(activeUsers?.map(u => u.user_id) || []).size;
        
        // 3. Buscar total de usuários registrados
        const { data: totalUsers } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });

        const totalUsersCount = totalUsers?.length || 0;
        const engagementRate = totalUsersCount > 0 ? (uniqueActiveUsers / totalUsersCount) * 100 : 0;

        if (engagementRate < 30 && totalUsersCount > 10) {
          recommendations.push({
            id: 'low-engagement',
            type: 'engagement',
            title: 'Aumentar Engajamento de Usuários',
            description: `Apenas ${engagementRate.toFixed(1)}% dos usuários estão ativos. Meta: 50%.`,
            impact: 'high',
            effort: 'high',
            priority: 85,
            category: 'Engajamento',
            actionItems: [
              'Criar programa de onboarding mais envolvente',
              'Implementar notificações push',
              'Desenvolver conteúdo mais interativo',
              'Adicionar comunidade ativa'
            ],
            metrics: {
              current: engagementRate,
              target: 50,
              unit: '%'
            }
          });
        }

        // 4. Analisar abandono por dificuldade
        const { data: solutionProgress } = await supabase
          .from('progress')
          .select(`
            is_completed,
            solutions!inner (
              difficulty
            )
          `)
          .gte('created_at', startDate.toISOString());

        if (solutionProgress && solutionProgress.length > 0) {
          const hardSolutions = solutionProgress.filter(sp => sp.solutions?.difficulty === 'Difícil');
          const hardCompletionRate = hardSolutions.length > 0 
            ? (hardSolutions.filter(hs => hs.is_completed).length / hardSolutions.length) * 100 
            : 0;

          if (hardCompletionRate < 20 && hardSolutions.length > 5) {
            recommendations.push({
              id: 'hard-content-optimization',
              type: 'content',
              title: 'Otimizar Conteúdo Difícil',
              description: `Soluções difíceis têm apenas ${hardCompletionRate.toFixed(1)}% de conclusão.`,
              impact: 'medium',
              effort: 'medium',
              priority: 70,
              category: 'Conteúdo',
              actionItems: [
                'Adicionar mais exemplos práticos',
                'Criar vídeos explicativos detalhados',
                'Implementar sistema de mentoria',
                'Dividir conteúdo em etapas menores'
              ],
              metrics: {
                current: hardCompletionRate,
                target: 40,
                unit: '%'
              }
            });
          }
        }

        // 5. Analisar tempo de resposta no fórum (se houver dados)
        const { data: forumActivity } = await supabase
          .from('forum_topics')
          .select('reply_count, created_at')
          .gte('created_at', startDate.toISOString());

        if (forumActivity && forumActivity.length > 0) {
          const topicsWithoutReplies = forumActivity.filter(t => t.reply_count === 0).length;
          const responseRate = ((forumActivity.length - topicsWithoutReplies) / forumActivity.length) * 100;

          if (responseRate < 60 && forumActivity.length > 10) {
            recommendations.push({
              id: 'improve-community-response',
              type: 'user_experience',
              title: 'Melhorar Resposta da Comunidade',
              description: `${responseRate.toFixed(1)}% dos tópicos recebem respostas. Meta: 80%.`,
              impact: 'medium',
              effort: 'low',
              priority: 60,
              category: 'Experiência do Usuário',
              actionItems: [
                'Implementar sistema de gamificação para respostas',
                'Destacar perguntas não respondidas',
                'Criar programa de moderadores voluntários',
                'Adicionar notificações para especialistas'
              ],
              metrics: {
                current: responseRate,
                target: 80,
                unit: '%'
              }
            });
          }
        }

        // Se não há dados suficientes, adicionar recomendação padrão
        if (recommendations.length === 0) {
          recommendations.push({
            id: 'data-collection',
            type: 'performance',
            title: 'Aumentar Coleta de Dados',
            description: 'Colete mais dados de uso para gerar recomendações personalizadas.',
            impact: 'low',
            effort: 'low',
            priority: 30,
            category: 'Análise',
            actionItems: [
              'Implementar mais eventos de tracking',
              'Adicionar formulários de feedback',
              'Configurar analytics avançados',
              'Criar dashboards de monitoramento'
            ],
            metrics: {
              current: 0,
              target: 100,
              unit: '%'
            }
          });
        }

        // Ordenar por prioridade
        recommendations.sort((a, b) => b.priority - a.priority);

        log('Recomendações automáticas geradas', { 
          count: recommendations.length,
          timeRange
        });

        return recommendations;

      } catch (error: any) {
        logWarning('Erro ao gerar recomendações automáticas', { 
          error: error.message,
          timeRange
        });
        
        // Retornar recomendação padrão em caso de erro
        return [{
          id: 'error-fallback',
          type: 'performance',
          title: 'Erro na Análise',
          description: 'Não foi possível gerar recomendações automáticas no momento.',
          impact: 'low',
          effort: 'low',
          priority: 10,
          category: 'Sistema',
          actionItems: ['Verificar conexão com banco de dados', 'Revisar logs de erro'],
          metrics: {
            current: 0,
            target: 100,
            unit: '%'
          }
        }];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false
  });
};
