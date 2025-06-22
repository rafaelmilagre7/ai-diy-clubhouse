
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LmsStatsData } from './types';

export const useStatsData = (startDate: string | null, npsScore: number) => {
  return useQuery({
    queryKey: ['lms-stats-data', startDate],
    queryFn: async (): Promise<LmsStatsData> => {
      console.log('📊 [STATS] Buscando estatísticas reais do LMS');
      
      try {
        // Buscar contagem de estudantes únicos com progresso
        let studentsQuery = supabase
          .from('learning_progress')
          .select('user_id', { count: 'exact', head: true })
          .gte('progress_percentage', 1);
          
        if (startDate) {
          studentsQuery = studentsQuery.gte('created_at', startDate);
        }
        
        const { count: totalStudents, error: studentsError } = await studentsQuery;

        if (studentsError) {
          console.error('❌ Erro ao buscar estudantes:', studentsError);
        }

        // Buscar contagem de aulas publicadas
        const { count: totalLessons, error: lessonsError } = await supabase
          .from('learning_lessons')
          .select('id', { count: 'exact', head: true })
          .eq('published', true);

        if (lessonsError) {
          console.error('❌ Erro ao buscar aulas:', lessonsError);
        }

        // Calcular taxa média de conclusão
        let progressQuery = supabase
          .from('learning_progress')
          .select('progress_percentage')
          .gte('progress_percentage', 1);
          
        if (startDate) {
          progressQuery = progressQuery.gte('created_at', startDate);
        }
        
        const { data: progressData, error: progressError } = await progressQuery;

        if (progressError) {
          console.error('❌ Erro ao buscar progresso:', progressError);
        }

        // Calcular média de conclusão
        let completionRate = 0;
        if (progressData && progressData.length > 0) {
          const totalProgress = progressData.reduce((sum, item) => sum + (item.progress_percentage || 0), 0);
          completionRate = Math.round(totalProgress / progressData.length);
        }

        const stats = {
          totalStudents: totalStudents || 0,
          totalLessons: totalLessons || 0,
          completionRate,
          npsScore
        };

        console.log('✅ Estatísticas do LMS carregadas:', stats);
        return stats;

      } catch (error: any) {
        console.error('❌ Erro ao processar estatísticas do LMS:', error);
        
        // Retornar dados vazios em caso de erro
        return {
          totalStudents: 0,
          totalLessons: 0,
          completionRate: 0,
          npsScore
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
};
