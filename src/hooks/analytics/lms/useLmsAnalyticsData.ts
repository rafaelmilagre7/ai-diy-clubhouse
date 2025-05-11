
import { useTimeRange } from './useTimeRange';
import { useNpsData } from './useNpsData';
import { useStatsData } from './useStatsData';
import { LmsAnalyticsData } from './types';
import { useLogging } from '@/hooks/useLogging';

// Hook principal que combina todos os dados de analytics do LMS
export const useLmsAnalyticsData = (timeRange: string): {
  npsData: LmsAnalyticsData['npsData'];
  statsData: LmsAnalyticsData['statsData'];
  feedbackData: LmsAnalyticsData['feedbackData'];
  isLoading: boolean;
} => {
  const { logWarning } = useLogging();
  
  // Obter a data de início baseada no intervalo de tempo
  const startDate = useTimeRange(timeRange);
  
  // Buscar dados de NPS
  const { 
    data: npsDataResult, 
    isLoading: isLoadingNps,
    error: npsError 
  } = useNpsData(startDate);
  
  // Se houver erro, logar como aviso não crítico
  if (npsError) {
    logWarning('Erro ao carregar dados de NPS', { 
      error: npsError,
      critical: false // Não mostrar toast
    });
  }
  
  // Buscar estatísticas gerais
  const { 
    data: statsData, 
    isLoading: isLoadingStats,
    error: statsError
  } = useStatsData(startDate, npsDataResult?.npsData?.overall || 0);
  
  // Se houver erro, logar como aviso não crítico
  if (statsError) {
    logWarning('Erro ao carregar estatísticas', { 
      error: statsError,
      critical: false // Não mostrar toast
    });
  }
  
  return {
    npsData: {
      overall: npsDataResult?.npsData?.overall || 0,
      distribution: npsDataResult?.npsData?.distribution || { promoters: 0, neutrals: 0, detractors: 0 },
      perLesson: npsDataResult?.npsData?.perLesson || []
    },
    statsData: statsData || {
      totalStudents: 0,
      totalLessons: 0,
      completionRate: 0,
      npsScore: 0
    },
    feedbackData: npsDataResult?.feedbackData || [],
    isLoading: isLoadingNps || isLoadingStats
  };
};
