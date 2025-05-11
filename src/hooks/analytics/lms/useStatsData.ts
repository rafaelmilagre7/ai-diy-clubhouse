
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { LmsStatsData } from './types';
import { useLogging } from '@/hooks/useLogging';

// Hook para buscar estatísticas gerais do LMS
export const useStatsData = (startDate: string | null, npsScore: number) => {
  const { log, logWarning } = useLogging();

  return useQuery({
    queryKey: ['lms-stats-data', startDate],
    queryFn: async (): Promise<LmsStatsData> => {
      try {
        // Buscar contagem total de alunos ativos (com algum progresso)
        const { count: totalStudents, error: studentsError } = await supabase
          .from('learning_progress')
          .select('user_id', { count: 'exact', head: true })
          .gte('progress_percentage', 1)
          .when(startDate !== null, query => 
            query.gte('created_at', startDate as string)
          );

        if (studentsError) {
          logWarning('Erro ao buscar total de alunos:', { 
            error: studentsError.message,
            critical: false
          });
        }

        // Buscar contagem total de aulas
        const { count: totalLessons, error: lessonsError } = await supabase
          .from('learning_lessons')
          .select('id', { count: 'exact', head: true })
          .eq('published', true);

        if (lessonsError) {
          logWarning('Erro ao buscar total de aulas:', { 
            error: lessonsError.message,
            critical: false
          });
        }

        // Calcular taxa média de conclusão
        const { data: progressData, error: progressError } = await supabase
          .from('learning_progress')
          .select('progress_percentage')
          .gte('progress_percentage', 1)
          .when(startDate !== null, query => 
            query.gte('created_at', startDate as string)
          );

        if (progressError) {
          logWarning('Erro ao buscar dados de progresso:', { 
            error: progressError.message,
            critical: false
          });
        }

        // Calcular média de conclusão
        let completionRate = 0;
        if (progressData && progressData.length > 0) {
          const totalProgress = progressData.reduce((sum, item) => sum + (item.progress_percentage || 0), 0);
          completionRate = Math.round(totalProgress / progressData.length);
        }

        // Retornar dados formatados
        return {
          totalStudents: totalStudents || 0,
          totalLessons: totalLessons || 0,
          completionRate,
          npsScore
        };

      } catch (error: any) {
        logWarning('Erro ao processar estatísticas do LMS:', { 
          error: error.message,
          stack: error.stack,
          critical: false
        });
        
        // Retornar valores padrão em caso de erro
        return {
          totalStudents: 0,
          totalLessons: 0,
          completionRate: 0,
          npsScore
        };
      }
    }
  });
};
