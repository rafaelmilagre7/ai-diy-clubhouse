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
    let videosWithDuration = 0;

    courseLessons?.forEach(lesson => {
      lesson.learning_lesson_videos?.forEach(video => {
        totalVideos++;
        if (video.duration_seconds && video.duration_seconds > 0) {
          totalSeconds += video.duration_seconds;
          videosWithDuration++;
        }
      });
    });

    // Se não temos durações reais, usar estimativa baseada no número de vídeos
    if (totalSeconds === 0 && totalVideos > 0) {
      totalSeconds = estimateDurationFromVideoCount(totalVideos);
      console.log(`📊 Usando estimativa para curso ${courseId}: ${totalVideos} vídeos = ${Math.round(totalSeconds / 3600)} horas`);
    }

    console.log('✅ Duração calculada:', {
      courseId,
      totalSeconds,
      totalVideos,
      videosWithDuration,
      isEstimated: videosWithDuration === 0 && totalVideos > 0,
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
 * Estima duração baseada no número de vídeos quando durações reais não estão disponíveis
 */
const estimateDurationFromVideoCount = (videoCount: number): number => {
  // Estimativa conservadora: 5-8 minutos por vídeo em média
  const averageMinutesPerVideo = 6;
  return videoCount * averageMinutesPerVideo * 60; // retorna em segundos
};

/**
 * Formata segundos em string legível para certificados
 */
export const formatDurationForCertificate = (seconds: number, videoCount: number = 0): string => {
  let finalSeconds = seconds;
  
  // Se não há duração real, usar estimativa baseada no número de vídeos
  if (seconds === 0 && videoCount > 0) {
    finalSeconds = estimateDurationFromVideoCount(videoCount);
    console.log(`📊 Estimando duração para ${videoCount} vídeos: ${Math.round(finalSeconds / 3600)} horas`);
  }
  
  // Fallback final para compatibilidade (quando não temos nem duração nem contagem)
  if (finalSeconds === 0) {
    return '8 horas';
  }

  const hours = Math.ceil(finalSeconds / 3600);
  
  if (hours < 1) {
    const minutes = Math.ceil(finalSeconds / 60);
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