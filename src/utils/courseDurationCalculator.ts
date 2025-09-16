import { supabase } from "@/lib/supabase";

/**
 * Calcula a duração total de um curso baseada nos vídeos das aulas
 */
export const calculateCourseDuration = async (courseId: string): Promise<number> => {
  try {
    console.log('🔍 Calculando duração para curso:', courseId);
    
    // Buscar todos os módulos do curso primeiro
    const { data: courseModules, error: moduleError } = await supabase
      .from('learning_modules')
      .select('id')
      .eq('course_id', courseId);

    if (moduleError) {
      console.error('❌ Erro ao buscar módulos do curso:', moduleError);
      return 0;
    }

    if (!courseModules || courseModules.length === 0) {
      console.log('⚠️ Nenhum módulo encontrado para o curso:', courseId);
      return 0;
    }

    const moduleIds = courseModules.map(m => m.id);
    
    // Buscar todas as lições desses módulos com seus vídeos
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
      .in('module_id', moduleIds);

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
      console.log(`📊 Usando estimativa para curso ${courseId}: ${totalVideos} vídeos = ${Math.round(totalSeconds / 3600)} horas (${Math.round(totalSeconds / 60)} min)`);
    } else if (totalSeconds === 0) {
      console.log(`⚠️ Nenhum vídeo encontrado para o curso ${courseId}`);
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
  console.log('🎯 [FORMAT_DURATION] Formatando duração:', { seconds, videoCount });
  
  let finalSeconds = seconds;
  
  // Se não há duração real, usar estimativa baseada no número de vídeos
  if (seconds === 0 && videoCount > 0) {
    finalSeconds = estimateDurationFromVideoCount(videoCount);
    console.log(`📊 [FORMAT_DURATION] Estimando duração para ${videoCount} vídeos: ${Math.round(finalSeconds / 3600)} horas`);
  }
  
  // Se ainda não tem duração, usar estimativa mínima (assumir pelo menos 4 vídeos)
  if (finalSeconds === 0) {
    console.log('⚠️ [FORMAT_DURATION] Sem duração nem vídeos, usando estimativa mínima');
    finalSeconds = estimateDurationFromVideoCount(4); // 4 vídeos = ~24 min = ~1 hora
  }

  const hours = Math.ceil(finalSeconds / 3600);
  
  console.log('✅ [FORMAT_DURATION] Resultado final:', { finalSeconds, hours });
  
  // Garantir sempre um resultado válido
  if (hours < 1) {
    const minutes = Math.ceil(finalSeconds / 60);
    const result = `${minutes} minutos`;
    console.log('📝 [FORMAT_DURATION] Retornando em minutos:', result);
    return result;
  }

  const result = `${hours} hora${hours > 1 ? 's' : ''}`;
  console.log('📝 [FORMAT_DURATION] Retornando em horas:', result);
  return result;
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