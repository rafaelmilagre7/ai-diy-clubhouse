
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLogging } from '@/hooks/useLogging';

interface AutoRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'performance' | 'engagement' | 'content' | 'user_experience';
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  priority: number;
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
        log('Gerando recomendações automáticas baseadas em dados', { timeRange });

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

        // 1. Buscar dados de progresso para análise
        const { data: progressData } = await supabase
          .from('progress')
          .select(`
            *,
            solutions(title, category, difficulty)
          `)
          .gte('created_at', startDate.toISOString());

        // 2. Buscar dados de usuários ativos
        const { data: activeUsers } = await supabase
          .from('analytics')
          .select('user_id')
          .gte('created_at', startDate.toISOString());

        // 3. Buscar dados de implementações
        const { data: implementations } = await supabase
          .from('user_solutions')
          .select('*')
          .gte('created_at', startDate.toISOString());

        const recommendations: AutoRecommendation[] = [];

        // Análise 1: Taxa de conclusão baixa
        const totalProgress = progressData?.length || 0;
        const completedProgress = progressData?.filter(p => p.is_completed).length || 0;
        const completionRate = totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0;

        if (completionRate < 60 && totalProgress > 10) {
          recommendations.push({
            id: 'low-completion-rate',
            title: 'Melhorar Taxa de Conclusão',
            description: 'A taxa de conclusão de implementações está abaixo do ideal. Considere revisar o conteúdo e adicionar mais suporte.',
            type: 'performance',
            impact: 'high',
            effort: 'medium',
            priority: 90,
            metrics: {
              current: completionRate,
              target: 75,
              unit: '%'
            },
            actionItems: [
              'Revisar módulos com maior taxa de abandono',
              'Adicionar mais exemplos práticos',
              'Implementar sistema de gamificação',
              'Criar conteúdo de apoio adicional'
            ]
          });
        }

        // Análise 2: Engajamento de usuários
        const uniqueActiveUsers = new Set(activeUsers?.map(u => u.user_id) || []).size;
        const totalImplementations = implementations?.length || 0;
        const engagementRate = uniqueActiveUsers > 0 ? (totalImplementations / uniqueActiveUsers) : 0;

        if (engagementRate < 2 && uniqueActiveUsers > 5) {
          recommendations.push({
            id: 'low-user-engagement',
            title: 'Aumentar Engajamento dos Usuários',
            description: 'Os usuários estão iniciando poucas implementações. Melhore a descoberta de conteúdo e motivação.',
            type: 'engagement',
            impact: 'high',
            effort: 'medium',
            priority: 85,
            metrics: {
              current: engagementRate,
              target: 3,
              unit: ' impl/usuário'
            },
            actionItems: [
              'Implementar sistema de recomendações personalizadas',
              'Criar trilhas de aprendizado guiadas',
              'Adicionar notificações de lembrete',
              'Melhorar onboarding inicial'
            ]
          });
        }

        // Análise 3: Distribuição de dificuldade
        const solutionsByDifficulty = progressData?.reduce((acc, progress) => {
          if (progress.solutions && Array.isArray(progress.solutions) && progress.solutions.length > 0) {
            const solution = progress.solutions[0];
            if (solution && solution.difficulty) {
              acc[solution.difficulty] = (acc[solution.difficulty] || 0) + 1;
            }
          }
          return acc;
        }, {} as Record<string, number>) || {};

        const beginnerCount = solutionsByDifficulty['beginner'] || 0;
        const totalSolutions = Object.values(solutionsByDifficulty).reduce((sum, count) => sum + count, 0);

        if (beginnerCount / totalSolutions > 0.8 && totalSolutions > 5) {
          recommendations.push({
            id: 'content-difficulty-balance',
            title: 'Diversificar Níveis de Dificuldade',
            description: 'Há um excesso de conteúdo para iniciantes. Adicione mais soluções intermediárias e avançadas.',
            type: 'content',
            impact: 'medium',
            effort: 'high',
            priority: 70,
            metrics: {
              current: (beginnerCount / totalSolutions) * 100,
              target: 50,
              unit: '% iniciante'
            },
            actionItems: [
              'Criar mais soluções de nível intermediário',
              'Desenvolver conteúdo avançado',
              'Implementar sistema de progressão gradual',
              'Adicionar pré-requisitos para soluções complexas'
            ]
          });
        }

        // Análise 4: Tempo de implementação
        const recentImplementations = implementations?.filter(impl => 
          impl.created_at && new Date(impl.created_at) > startDate
        ) || [];

        if (recentImplementations.length < uniqueActiveUsers * 0.5 && uniqueActiveUsers > 3) {
          recommendations.push({
            id: 'implementation-speed',
            title: 'Acelerar Início de Implementações',
            description: 'Usuários estão demorando para iniciar implementações após o cadastro.',
            type: 'user_experience',
            impact: 'medium',
            effort: 'low',
            priority: 65,
            metrics: {
              current: recentImplementations.length,
              target: Math.ceil(uniqueActiveUsers * 0.8),
              unit: ' implementações'
            },
            actionItems: [
              'Simplificar processo de seleção de soluções',
              'Adicionar tour guiado na primeira visita',
              'Criar dashboard mais intuitivo',
              'Implementar sugestões automáticas na homepage'
            ]
          });
        }

        // Ordenar por prioridade
        recommendations.sort((a, b) => b.priority - a.priority);

        log('Recomendações automáticas geradas', { 
          count: recommendations.length,
          timeRange,
          dataAnalyzed: {
            totalProgress,
            completedProgress,
            uniqueActiveUsers,
            totalImplementations
          }
        });

        return recommendations;

      } catch (error: any) {
        logWarning('Erro ao gerar recomendações automáticas', { 
          error: error.message,
          timeRange
        });
        
        // Retornar lista vazia em caso de erro
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false
  });
};
