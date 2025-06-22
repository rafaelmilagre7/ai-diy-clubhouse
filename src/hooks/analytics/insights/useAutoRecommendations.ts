
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLogging } from '@/hooks/useLogging';

interface AutoRecommendation {
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

  return useQuery({
    queryKey: ['auto-recommendations', timeRange],
    queryFn: async (): Promise<AutoRecommendation[]> => {
      try {
        log('Buscando dados para recomendações automáticas', { timeRange });

        // Calcular período baseado no timeRange
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

        // 1. Buscar dados de progresso com soluções
        const { data: progressData } = await supabase
          .from('progress')
          .select(`
            *,
            solutions!inner(
              id,
              title,
              difficulty,
              category
            )
          `)
          .gte('created_at', startDate.toISOString());

        // 2. Buscar todos os usuários ativos
        const { data: activeUsers } = await supabase
          .from('profiles')
          .select('id')
          .gte('updated_at', startDate.toISOString());

        // 3. Buscar dados de analytics
        const { data: analyticsData } = await supabase
          .from('analytics')
          .select('*')
          .gte('created_at', startDate.toISOString());

        const recommendations: AutoRecommendation[] = [];

        // Análise 1: Taxa de conclusão baixa
        if (progressData && progressData.length > 0) {
          const completedCount = progressData.filter(p => p.is_completed === true).length;
          const totalCount = progressData.length;
          const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

          if (completionRate < 60) {
            recommendations.push({
              id: 'low-completion-rate',
              type: 'performance',
              title: 'Melhorar Taxa de Conclusão',
              description: `A taxa de conclusão atual está em ${completionRate.toFixed(1)}%, abaixo do ideal de 70%. Isso pode indicar que as soluções estão muito complexas ou falta engajamento.`,
              priority: 85,
              impact: 'high',
              effort: 'medium',
              metrics: {
                current: completionRate,
                target: 70,
                unit: '%'
              },
              actionItems: [
                'Revisar soluções com maior taxa de abandono',
                'Simplificar módulos complexos',
                'Adicionar mais checkpoints de progresso',
                'Implementar sistema de gamificação'
              ]
            });
          }
        }

        // Análise 2: Baixo engajamento de usuários
        const activeUsersCount = activeUsers?.length || 0;
        const totalProgressCount = progressData?.length || 0;
        const engagementRate = activeUsersCount > 0 ? (totalProgressCount / activeUsersCount) : 0;

        if (engagementRate < 2) {
          recommendations.push({
            id: 'low-user-engagement',
            type: 'engagement',
            title: 'Aumentar Engajamento dos Usuários',
            description: `Cada usuário ativo inicia em média ${engagementRate.toFixed(1)} implementações. O ideal seria pelo menos 3 implementações por usuário.`,
            priority: 75,
            impact: 'high',
            effort: 'low',
            metrics: {
              current: engagementRate,
              target: 3,
              unit: ' impl/usuário'
            },
            actionItems: [
              'Enviar notificações de novas soluções',
              'Criar programa de recomendações personalizadas',
              'Implementar lembretes por email',
              'Adicionar sistema de conquistas'
            ]
          });
        }

        // Análise 3: Soluções difíceis com alta taxa de abandono
        if (progressData && progressData.length > 0) {
          const hardSolutions = progressData.filter(p => {
            const solution = Array.isArray(p.solutions) ? p.solutions[0] : p.solutions;
            return solution && solution.difficulty === 'hard';
          });

          if (hardSolutions.length > 0) {
            const hardCompletedCount = hardSolutions.filter(p => p.is_completed === true).length;
            const hardCompletionRate = (hardCompletedCount / hardSolutions.length) * 100;

            if (hardCompletionRate < 40) {
              recommendations.push({
                id: 'hard-solutions-abandonment',
                type: 'content',
                title: 'Melhorar Soluções Difíceis',
                description: `Soluções de nível difícil têm apenas ${hardCompletionRate.toFixed(1)}% de conclusão. Considere adicionar mais suporte ou dividir em etapas menores.`,
                priority: 70,
                impact: 'medium',
                effort: 'high',
                metrics: {
                  current: hardCompletionRate,
                  target: 50,
                  unit: '%'
                },
                actionItems: [
                  'Dividir soluções complexas em módulos menores',
                  'Adicionar vídeos explicativos detalhados',
                  'Criar sistema de mentoria para soluções difíceis',
                  'Implementar pré-requisitos claros'
                ]
              });
            }
          }
        }

        // Análise 4: Falta de diversidade nas implementações
        if (progressData && progressData.length > 0) {
          const categoryCounts: Record<string, number> = {};
          progressData.forEach(p => {
            const solution = Array.isArray(p.solutions) ? p.solutions[0] : p.solutions;
            if (solution && solution.category) {
              const category = String(solution.category);
              categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            }
          });

          const categories = Object.keys(categoryCounts);
          const maxCategory = categories.reduce((a, b) => 
            categoryCounts[a] > categoryCounts[b] ? a : b, categories[0]
          );

          if (categories.length > 0) {
            const maxCategoryPercent = (categoryCounts[maxCategory] / progressData.length) * 100;

            if (maxCategoryPercent > 70) {
              recommendations.push({
                id: 'category-diversification',
                type: 'user_experience',
                title: 'Diversificar Categorias de Implementação',
                description: `${maxCategoryPercent.toFixed(1)}% das implementações estão concentradas na categoria "${maxCategory}". Promover outras categorias pode melhorar a experiência.`,
                priority: 60,
                impact: 'medium',
                effort: 'low',
                metrics: {
                  current: maxCategoryPercent,
                  target: 50,
                  unit: '%'
                },
                actionItems: [
                  'Destacar soluções de outras categorias',
                  'Criar campanhas promocionais para categorias menos populares',
                  'Implementar sistema de recomendações cruzadas',
                  'Adicionar badges para explorar diferentes categorias'
                ]
              });
            }
          }
        }

        // Se não há recomendações baseadas em dados, adicionar uma recomendação padrão
        if (recommendations.length === 0) {
          recommendations.push({
            id: 'insufficient-data',
            type: 'performance',
            title: 'Coletar Mais Dados',
            description: 'Ainda não há dados suficientes para gerar recomendações específicas. Continue monitorando o desempenho da plataforma.',
            priority: 50,
            impact: 'low',
            effort: 'low',
            metrics: {
              current: progressData?.length || 0,
              target: 100,
              unit: ' implementações'
            },
            actionItems: [
              'Promover mais uso da plataforma',
              'Incentivar feedback dos usuários',
              'Monitorar métricas de engajamento',
              'Implementar sistema de analytics mais detalhado'
            ]
          });
        }

        // Ordenar por prioridade
        recommendations.sort((a, b) => b.priority - a.priority);

        log('Recomendações automáticas geradas', { 
          timeRange,
          recommendationsCount: recommendations.length,
          dataPoints: {
            progress: progressData?.length || 0,
            activeUsers: activeUsersCount,
            analytics: analyticsData?.length || 0
          }
        });

        return recommendations;

      } catch (error: any) {
        logWarning('Erro ao gerar recomendações automáticas', { 
          error: error.message,
          timeRange
        });
        
        // Retornar array vazio em caso de erro
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false
  });
};
