
import { useTimeRange } from './useTimeRange';
import { useNpsData } from './useNpsData';
import { useStatsData } from './useStatsData';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

// Interface atualizada para compatibilidade com o componente
interface LmsAnalyticsResult {
  totalCourses: number;
  totalStudents: number;
  averageCompletionTime: number;
  completionRate: number;
  courseProgress: Array<{
    name: string;
    completed: number;
    total: number;
  }>;
  npsScores: Array<{
    lesson: string;
    score: number;
    responses: number;
  }>;
  isLoading: boolean;
  refresh: () => void;
}

export const useLmsAnalyticsData = (timeRange: string): LmsAnalyticsResult => {
  const queryClient = useQueryClient();
  
  // Obter a data de início baseada no intervalo de tempo
  const startDate = useTimeRange(timeRange);
  
  // Buscar dados de NPS
  const { 
    data: npsDataResult, 
    isLoading: isLoadingNps,
    error: npsError 
  } = useNpsData(startDate);
  
  // Buscar estatísticas gerais
  const { 
    data: statsData, 
    isLoading: isLoadingStats,
    error: statsError
  } = useStatsData(startDate, npsDataResult?.npsData?.overall || 0);
  
  // Log de erros (sem toast para não ser intrusivo)
  if (npsError) {
    console.error('Erro ao carregar dados de NPS:', npsError);
  }
  
  if (statsError) {
    console.error('Erro ao carregar estatísticas:', statsError);
  }

  // Função para atualizar os dados
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['lms-nps-data'] });
    queryClient.invalidateQueries({ queryKey: ['lms-stats-data'] });
  }, [queryClient]);
  
  // Processar dados de progresso por curso (vazio se não há dados)
  const courseProgress = statsData?.totalLessons > 0 ? [
    {
      name: 'Cursos em Andamento',
      completed: Math.floor((statsData.completionRate / 100) * statsData.totalStudents),
      total: statsData.totalStudents
    }
  ] : [];

  // Processar NPS scores por aula
  const npsScores = npsDataResult?.npsData?.perLesson?.slice(0, 5).map(lesson => ({
    lesson: lesson.lessonTitle,
    score: lesson.npsScore,
    responses: lesson.responseCount
  })) || [];
  
  return {
    totalCourses: statsData?.totalLessons || 0,
    totalStudents: statsData?.totalStudents || 0,
    averageCompletionTime: 45, // Pode ser calculado se tivermos dados de tempo
    completionRate: statsData?.completionRate || 0,
    courseProgress,
    npsScores,
    isLoading: isLoadingNps || isLoadingStats,
    refresh
  };
};
