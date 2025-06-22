
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
  const { validateNumericValue, validatePercentage } = useDataValidation();

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

        // Validar dados básicos
        const totalUsersValidation = validateNumericValue(users?.length);
        const totalImplementationsValidation = validateNumericValue(implementations?.length);
        
        if (!totalUsersValidation.isValid || !totalImplementationsValidation.isValid) {
          log('Dados insuficientes para gerar recomendações', { 
            users: users?.length,
            implementations: implementations?.length
          });
          return [];
        }

        const totalUsers = totalUsersValidation.value!;
        const totalImplementations = totalImplementationsValidation.value!;

        // Analisar taxa de conclusão apenas se houver implementações
        if (totalImplementations > 0) {
          const completedValidation = validateNumericValue(
            implementations?.filter(i => i.is_completed).length
          );
          
          if (completedValidation.isValid) {
            const completedImplementations = completedValidation.value!;
            const completionRate = (completedImplementations / totalImplementations) * 100;

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
                  current: Math.round(completionRate * 10) / 10,
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
          }
        }

        // Analisar engajamento de usuários apenas se houver dados de analytics
        if (analytics && analytics.length > 0 && totalUsers > 0) {
          const activeUsers = new Set(analytics.map(a => a.user_id)).size;
          const engagementRate = (activeUsers / totalUsers) * 100;

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
                current: Math.round(engagementRate * 10) / 10,
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
        }

        // Analisar conteúdo apenas se houver soluções
        if (solutions && solutions.length > 0) {
          const publishedValidation = validateNumericValue(
            solutions.filter(s => s.is_published).length
          );
          
          if (publishedValidation.isValid && publishedValidation.value! < 5) {
            recommendations.push({
              id: 'expand-content',
              type: 'content',
              title: 'Expandir Biblioteca de Conteúdo',
              description: 'Poucos conteúdos publicados limitam as opções dos usuários.',
              priority: 60,
              impact: 'medium',
              effort: 'high',
              metrics: {
                current: publishedValidation.value!,
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
        throw new Error(`Falha ao gerar recomendações: ${error.message}`);
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (recomendações não mudam tão frequentemente)
    refetchOnWindowFocus: false
  });
};
