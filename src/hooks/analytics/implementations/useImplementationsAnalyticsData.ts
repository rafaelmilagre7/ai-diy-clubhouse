
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import { useTimeRange } from '../lms/useTimeRange';

export interface ImplementationData {
  completionRate: {
    completed: number;
    inProgress: number;
  };
  implementationsByDifficulty: Array<{
    difficulty: string;
    count: number;
  }>;
  averageCompletionTime: Array<{
    solutionId: string;
    solutionTitle: string;
    avgDays: number;
    count: number;
  }>;
  abandonmentByModule: Array<{
    moduleOrder: number;
    moduleTitle: string;
    abandonmentRate: number;
    totalStarts: number;
  }>;
  recentImplementations: Array<{
    id: string;
    solutionTitle: string;
    userName: string;
    status: string;
    lastActivity: string;
    percentComplete: number;
  }>;
}

export const useImplementationsAnalyticsData = (timeRangeStr: string) => {
  const { log, logWarning } = useLogging();
  const startDate = useTimeRange(timeRangeStr);

  return useQuery({
    queryKey: ['implementations-analytics', timeRangeStr],
    queryFn: async (): Promise<ImplementationData> => {
      try {
        log('Buscando dados de analytics de implementações', { startDate });

        // 1. Buscar dados sobre conclusões
        let completionQuery = supabase
          .from('progress')
          .select('is_completed');

        if (startDate) {
          completionQuery = completionQuery.gte('created_at', startDate);
        }

        // Executando a consulta e contando resultados
        const { data: completionData, error: completionError } = await completionQuery;

        if (completionError) {
          logWarning('Erro ao buscar dados de conclusão', { 
            error: completionError.message, 
            critical: false 
          });
        }

        // 2. Implementações por dificuldade
        let difficultyQuery = supabase
          .from('progress')
          .select(`
            solution_id,
            solutions!inner (
              difficulty
            )
          `);

        if (startDate) {
          difficultyQuery = difficultyQuery.gte('created_at', startDate);
        }

        const { data: difficultyData, error: difficultyError } = await difficultyQuery;

        if (difficultyError) {
          logWarning('Erro ao buscar implementações por dificuldade', { 
            error: difficultyError.message, 
            critical: false 
          });
        }

        // 3. Tempo médio de implementação
        let timeQuery = supabase
          .from('progress')
          .select(`
            id,
            solution_id,
            created_at,
            completed_at,
            solutions!inner (
              title
            )
          `)
          .eq('is_completed', true);

        if (startDate) {
          timeQuery = timeQuery.gte('created_at', startDate);
        }

        const { data: timeData, error: timeError } = await timeQuery;

        if (timeError) {
          logWarning('Erro ao buscar dados de tempo de implementação', { 
            error: timeError.message, 
            critical: false 
          });
        }

        // 4. Abandono por módulo
        let abandonmentQuery = supabase
          .from('modules')
          .select(`
            id,
            title,
            module_order,
            solution_id,
            solutions!inner (
              title
            )
          `)
          .order('module_order');

        const { data: moduleData, error: moduleError } = await abandonmentQuery;

        if (moduleError) {
          logWarning('Erro ao buscar módulos', { 
            error: moduleError.message, 
            critical: false 
          });
        }

        // 5. Implementações recentes
        let recentQuery = supabase
          .from('progress')
          .select(`
            id,
            user_id,
            solution_id,
            is_completed,
            current_module,
            last_activity,
            completed_modules,
            solutions!inner (
              title,
              id
            ),
            profiles!inner (
              name
            )
          `)
          .order('last_activity', { ascending: false })
          .limit(10);

        if (startDate) {
          recentQuery = recentQuery.gte('last_activity', startDate);
        }

        const { data: recentData, error: recentError } = await recentQuery;

        if (recentError) {
          logWarning('Erro ao buscar implementações recentes', { 
            error: recentError.message, 
            critical: false 
          });
        }

        // Processar dados de conclusão
        const completedCount = completionData?.filter(item => item.is_completed)?.length || 0;
        const inProgressCount = completionData?.filter(item => !item.is_completed)?.length || 0;

        // Processar dados por dificuldade
        const difficultyMap: Record<string, number> = {};
        difficultyData?.forEach(item => {
          // Verificar se solutions existe e possui a propriedade difficulty
          const difficulty = item.solutions?.difficulty || 'Desconhecido';
          if (!difficultyMap[difficulty]) {
            difficultyMap[difficulty] = 0;
          }
          difficultyMap[difficulty]++;
        });
        
        const implementationsByDifficulty = Object.entries(difficultyMap).map(([difficulty, count]) => ({
          difficulty,
          count
        }));

        // Processar dados de tempo de conclusão
        const solutionCompletionTimes: Record<string, { totalDays: number; count: number; title: string }> = {};
        
        timeData?.forEach(item => {
          if (item.completed_at && item.created_at) {
            const startDate = new Date(item.created_at);
            const endDate = new Date(item.completed_at);
            const daysToComplete = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
            
            if (!solutionCompletionTimes[item.solution_id]) {
              // Verificar se solutions existe e possui a propriedade title
              const title = item.solutions?.title || 'Solução desconhecida';
              solutionCompletionTimes[item.solution_id] = { 
                totalDays: 0, 
                count: 0, 
                title
              };
            }
            
            solutionCompletionTimes[item.solution_id].totalDays += daysToComplete;
            solutionCompletionTimes[item.solution_id].count += 1;
          }
        });
        
        const averageCompletionTime = Object.entries(solutionCompletionTimes).map(([solutionId, data]) => ({
          solutionId,
          solutionTitle: data.title,
          avgDays: Math.round((data.totalDays / data.count) * 10) / 10, // Arredonda para 1 casa decimal
          count: data.count
        })).sort((a, b) => b.count - a.count).slice(0, 6); // Top 6 soluções mais implementadas
        
        // Processar dados de abandono por módulo
        // Para cada módulo, calculamos a taxa de abandono com base nas implementações
        const abandonmentByModule = moduleData?.map(module => {
          const moduleTitle = module.title || 'Módulo sem título';

          // Garantir que temos acesso ao solution_id
          if (!module.solution_id) return null;
          
          const totalStarts = recentData?.filter(item => 
            item.solution_id === module.solution_id && 
            item.current_module >= module.module_order
          ).length || 0;
          
          const totalCompletions = recentData?.filter(item => 
            item.solution_id === module.solution_id && 
            ((item.completed_modules && item.completed_modules.includes(module.module_order)) || item.is_completed)
          ).length || 0;
          
          let abandonmentRate = 0;
          if (totalStarts > 0) {
            abandonmentRate = Math.round(((totalStarts - totalCompletions) / totalStarts) * 100);
          }
          
          return {
            moduleOrder: module.module_order,
            moduleTitle,
            abandonmentRate,
            totalStarts
          };
        })
        .filter(Boolean) // Remover itens nulos
        .sort((a, b) => b!.abandonmentRate - a!.abandonmentRate)
        .slice(0, 10); // Top 10 módulos com maior taxa de abandono
        
        // Processar implementações recentes
        const recentImplementations = recentData?.map(item => {
          // Verificar se solutions e profiles existem e possuem as propriedades necessárias
          const solutionTitle = item.solutions?.title || 'Solução desconhecida';
          const userName = item.profiles?.name || 'Usuário desconhecido';
          
          // Calcular percentual completo com base nos módulos completados
          let percentComplete = 0;
          if (item.is_completed) {
            percentComplete = 100;
          } else if (item.completed_modules && item.completed_modules.length > 0) {
            // Se não foi possível determinar o total de módulos, assumir que current_module é o último
            const totalModules = item.current_module + 1;
            percentComplete = Math.round((item.completed_modules.length / totalModules) * 100);
          }
          
          return {
            id: item.id,
            solutionTitle,
            userName,
            status: item.is_completed ? 'Concluído' : 'Em andamento',
            lastActivity: new Date(item.last_activity).toLocaleDateString('pt-BR'),
            percentComplete
          };
        }) || [];
        
        return {
          completionRate: {
            completed: completedCount,
            inProgress: inProgressCount
          },
          implementationsByDifficulty,
          averageCompletionTime,
          abandonmentByModule: abandonmentByModule as ImplementationData['abandonmentByModule'],
          recentImplementations
        };

      } catch (error: any) {
        logWarning('Erro ao processar dados de analytics de implementações', { 
          error: error.message,
          stack: error.stack,
          critical: false
        });
        
        // Retornar estrutura vazia em caso de erro
        return {
          completionRate: {
            completed: 0,
            inProgress: 0
          },
          implementationsByDifficulty: [],
          averageCompletionTime: [],
          abandonmentByModule: [],
          recentImplementations: []
        };
      }
    }
  });
};
