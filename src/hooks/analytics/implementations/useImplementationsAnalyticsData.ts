
import { useQuery } from '@tanstack/react-query';
import { useLogging } from '@/hooks/useLogging';
import { useTimeRange } from '../lms/useTimeRange';
import { ImplementationData } from './types/implementationTypes';
import { 
  fetchCompletionData,
  fetchDifficultyData,
  fetchTimeCompletionData,
  fetchModuleData,
  fetchRecentImplementations
} from './queries/implementationQueries';
import {
  processCompletionRate,
  processDifficultyDistribution,
  processCompletionTime,
  processModuleAbandonment,
  processRecentImplementations
} from './processors/dataProcessors';

export type { ImplementationData } from './types/implementationTypes';

export const useImplementationsAnalyticsData = (timeRangeStr: string) => {
  const { log, logWarning } = useLogging();
  const startDate = useTimeRange(timeRangeStr);

  return useQuery({
    queryKey: ['implementations-analytics', timeRangeStr],
    queryFn: async (): Promise<ImplementationData> => {
      try {
        log('Buscando dados de analytics de implementações', { startDate });

        // 1. Buscar todos os dados necessários
        const completionData = await fetchCompletionData(startDate);
        const difficultyData = await fetchDifficultyData(startDate);
        const timeData = await fetchTimeCompletionData(startDate);
        const moduleData = await fetchModuleData();
        const recentData = await fetchRecentImplementations(startDate);
        
        // 2. Processar os dados
        const completionRate = processCompletionRate(completionData);
        const implementationsByDifficulty = processDifficultyDistribution(difficultyData);
        const averageCompletionTime = processCompletionTime(timeData);
        const abandonmentByModule = processModuleAbandonment(moduleData, recentData);
        const recentImplementations = processRecentImplementations(recentData);
        
        return {
          completionRate,
          implementationsByDifficulty,
          averageCompletionTime,
          abandonmentByModule,
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
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
};
