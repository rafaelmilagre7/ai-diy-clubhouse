
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { LmsStatsData } from './types';

// Hook para buscar estatísticas gerais do LMS
export const useStatsData = (startDate: string | null, npsScore: number) => {
  return useQuery({
    queryKey: ['lms-stats-data', startDate],
    queryFn: async (): Promise<LmsStatsData> => {
      // Buscar contagem de usuários únicos com progresso
      const { count: studentsCount, error: studentsError } = await supabase
        .from('learning_progress')
        .select('user_id', { count: 'exact', head: true })
        .gte('progress_percentage', 1);
      
      if (studentsError) {
        console.error('Erro ao buscar contagem de alunos:', studentsError);
      }
      
      // Buscar total de aulas
      const { count: lessonsCount, error: lessonsError } = await supabase
        .from('learning_lessons')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);
        
      if (lessonsError) {
        console.error('Erro ao buscar contagem de aulas:', lessonsError);
      }
      
      // Buscar taxa de conclusão
      let query = supabase
        .from('learning_progress')
        .select('progress_percentage');
      
      // Aplicar filtro de data se necessário
      if (startDate) {
        query = query.gte('updated_at', startDate);
      }
      
      const { data: progress, error: progressError } = await query;
      
      if (progressError) {
        console.error('Erro ao buscar progresso:', progressError);
      }
      
      // Calcular taxa média de conclusão
      const completedLessons = progress?.filter(p => p.progress_percentage >= 100)?.length || 0;
      const totalLessonsProgress = progress?.length || 1; // Evitar divisão por zero
      const completionRate = Math.round((completedLessons / totalLessonsProgress) * 100);
      
      return {
        totalStudents: studentsCount || 0,
        totalLessons: lessonsCount || 0,
        completionRate: completionRate,
        npsScore: npsScore
      };
    },
    enabled: npsScore !== undefined
  });
};
