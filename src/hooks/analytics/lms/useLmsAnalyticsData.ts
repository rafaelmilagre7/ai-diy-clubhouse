
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
  const npsResult = useNpsData();
  
  // Buscar estatísticas gerais
  const statsResult = useStatsData();
  
  // Log de erros (sem toast para não ser intrusivo)
  if (npsResult.error) {
    console.error('Erro ao carregar dados de NPS:', npsResult.error);
  }
  
  if (statsResult.error) {
    console.error('Erro ao carregar estatísticas:', statsResult.error);
  }

  // Função para atualizar os dados
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['lms-nps-data'] });
    queryClient.invalidateQueries({ queryKey: ['lms-stats-data'] });
  }, [queryClient]);
  
  // Processar dados de progresso por curso (vazio se não há dados)
  const courseProgress = statsResult?.stats?.totalLessons > 0 ? [
    {
      name: 'Cursos em Andamento',
      completed: Math.floor((statsResult.stats.avgCompletionRate / 100) * statsResult.stats.totalStudents),
      total: statsResult.stats.totalStudents
    }
  ] : [];

  // Processar NPS scores por aula
  const npsScores = npsResult?.data?.npsData?.perLesson?.slice(0, 5).map(lesson => ({
    lesson: lesson.lessonTitle,
    score: lesson.npsScore,
    responses: lesson.responseCount
  })) || [];
  
  return {
    totalCourses: statsResult?.stats?.totalLessons || 0,
    totalStudents: statsResult?.stats?.totalStudents || 0,
    averageCompletionTime: 45, // Pode ser calculado se tivermos dados de tempo
    completionRate: statsResult?.stats?.avgCompletionRate || 0,
    courseProgress,
    npsScores,
    isLoading: npsResult.isLoading || statsResult.loading,
    refresh
  };
};
