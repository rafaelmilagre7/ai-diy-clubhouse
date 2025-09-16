import { supabase } from "@/lib/supabase";

/**
 * Calcula a duração total de um curso baseada nos vídeos das aulas
 */
export const calculateCourseDuration = async (courseId: string): Promise<number> => {
  try {
    console.log('🔍 Calculando duração para curso:', courseId);
    
    const { data: courseLessons, error } = await supabase
      .from('learning_lessons')
      .select(`
        id,
        title,
        learning_lesson_videos (
          id,
          duration_seconds
        )
      `)
      .eq('module_id', supabase
        .from('learning_modules')
        .select('id')
        .eq('course_id', courseId)
      );

    if (error) {
      console.error('❌ Erro ao buscar lições do curso:', error);
      return 0;
    }

    let totalSeconds = 0;
    let totalVideos = 0;

    courseLessons?.forEach(lesson => {
      lesson.learning_lesson_videos?.forEach(video => {
        if (video.duration_seconds && video.duration_seconds > 0) {
          totalSeconds += video.duration_seconds;
          totalVideos++;
        }
      });
    });

    console.log('✅ Duração calculada:', {
      courseId,
      totalSeconds,
      totalVideos,
      totalMinutes: Math.round(totalSeconds / 60),
      totalHours: Math.round(totalSeconds / 3600)
    });

    return totalSeconds;
  } catch (error) {
    console.error('❌ Erro ao calcular duração do curso:', error);
    return 0;
  }
};

/**
 * Formata segundos em string legível para certificados
 */
export const formatDurationForCertificate = (seconds: number): string => {
  if (seconds === 0) return '8 horas'; // Fallback para compatibilidade

  const hours = Math.ceil(seconds / 3600);
  
  if (hours < 1) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minutos`;
  }

  return `${hours} hora${hours > 1 ? 's' : ''}`;
};

/**
 * Calcula durações de múltiplos cursos de uma vez
 */
export const calculateMultipleCourseDurations = async (courseIds: string[]): Promise<Record<string, number>> => {
  try {
    const results = await Promise.all(
      courseIds.map(async (courseId) => ({
        courseId,
        duration: await calculateCourseDuration(courseId)
      }))
    );

    return results.reduce((acc, { courseId, duration }) => {
      acc[courseId] = duration;
      return acc;
    }, {} as Record<string, number>);
  } catch (error) {
    console.error('❌ Erro ao calcular múltiplas durações:', error);
    return {};
  }
};