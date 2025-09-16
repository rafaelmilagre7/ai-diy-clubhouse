import { supabase } from "@/lib/supabase";

/**
 * Calcula a duração total de um curso somando as durações dos vídeos de todas as aulas
 * PRIORIZA DURAÇÕES REAIS DA API DO PANDA VIDEO
 */
export const calculateCourseDuration = async (courseId: string): Promise<number> => {
  try {
    console.log('🔄 [CALC_DURATION] Iniciando cálculo REAL para curso:', courseId);
    
    // Buscar todos os módulos do curso
    const { data: modules, error: modulesError } = await supabase
      .from('learning_modules')
      .select('id')
      .eq('course_id', courseId)
      .eq('is_active', true);

    if (modulesError) {
      console.error('❌ [CALC_DURATION] Erro ao buscar módulos:', modulesError);
      throw modulesError;
    }

    if (!modules || modules.length === 0) {
      console.log('⚠️ [CALC_DURATION] Nenhum módulo encontrado para o curso');
      return 0;
    }

    const moduleIds = modules.map(m => m.id);
    console.log('📚 [CALC_DURATION] Módulos encontrados:', moduleIds.length);

    // Buscar todas as aulas dos módulos com os vídeos
    const { data: lessons, error: lessonsError } = await supabase
      .from('learning_lessons')
      .select(`
        id,
        title,
        learning_lesson_videos!inner(
          id,
          title,
          duration_seconds
        )
      `)
      .in('module_id', moduleIds)
      .eq('is_active', true);

    if (lessonsError) {
      console.error('❌ [CALC_DURATION] Erro ao buscar aulas:', lessonsError);
      throw lessonsError;
    }

    console.log('🎥 [CALC_DURATION] Aulas com vídeos encontradas:', lessons?.length || 0);

    let totalRealDurationSeconds = 0;
    let totalVideoCount = 0;
    let videosWithRealDuration = 0;

    if (lessons && lessons.length > 0) {
      for (const lesson of lessons) {
        if (lesson.learning_lesson_videos && lesson.learning_lesson_videos.length > 0) {
          for (const video of lesson.learning_lesson_videos) {
            totalVideoCount++;
            
            // APENAS durações REAIS da API (duration_seconds > 0)
            if (video.duration_seconds && video.duration_seconds > 0) {
              totalRealDurationSeconds += video.duration_seconds;
              videosWithRealDuration++;
              console.log(`✅ [VIDEO_REAL] ${video.title}: ${video.duration_seconds}s`);
            } else {
              console.log(`⏳ [VIDEO_PENDING] ${video.title}: aguardando sincronização`);
            }
          }
        }
      }
    }

    console.log('📊 [CALC_DURATION] Estatísticas REAIS:', {
      totalVideoCount,
      videosWithRealDuration,
      totalRealDurationSeconds,
      percentageSynced: totalVideoCount > 0 ? Math.round((videosWithRealDuration / totalVideoCount) * 100) : 0
    });

    // PRIORIDADE 1: Se temos durações reais, usar apenas elas
    if (videosWithRealDuration > 0) {
      console.log(`🏆 [CALC_DURATION] USANDO DURAÇÕES REAIS: ${videosWithRealDuration}/${totalVideoCount} vídeos = ${totalRealDurationSeconds}s`);
      
      // Se temos todas as durações, retornar total real
      if (videosWithRealDuration === totalVideoCount) {
        console.log('🎯 [CALC_DURATION] 100% das durações são reais!');
        return totalRealDurationSeconds;
      }
      
      // Se temos pelo menos 30% das durações, fazer projeção inteligente
      if (videosWithRealDuration >= totalVideoCount * 0.3) {
        const avgRealDurationPerVideo = totalRealDurationSeconds / videosWithRealDuration;
        const projectedTotal = avgRealDurationPerVideo * totalVideoCount;
        
        console.log(`📈 [CALC_DURATION] Projeção baseada em durações reais: ${Math.round(avgRealDurationPerVideo)}s/vídeo × ${totalVideoCount} = ${Math.round(projectedTotal)}s`);
        return Math.round(projectedTotal);
      }
      
      // Se temos poucas durações reais, usar apenas o que temos (sem projeção para evitar subestimativas)
      console.log(`⚖️ [CALC_DURATION] Poucas durações reais (${videosWithRealDuration}), usando apenas valores confirmados: ${totalRealDurationSeconds}s`);
      return totalRealDurationSeconds;
    }
    
    // PRIORIDADE 2: Se não há durações reais, usar estimativa de 6 min por vídeo
    if (totalVideoCount > 0) {
      const fallbackDuration = estimateDurationFromVideoCount(totalVideoCount);
      console.log(`🔮 [CALC_DURATION] FALLBACK: ${totalVideoCount} vídeos × 6min = ${fallbackDuration}s`);
      return fallbackDuration;
    }
    
    console.log('⚠️ [CALC_DURATION] Nenhum vídeo encontrado, retornando 0');
    return 0;

  } catch (error) {
    console.error('💥 [CALC_DURATION] Erro no cálculo:', error);
    return 0;
  }
};

/**
 * Estima duração baseada no número de vídeos quando durações reais não estão disponíveis
 */
export const estimateDurationFromVideoCount = (videoCount: number): number => {
  // Estimativa: 6 minutos por vídeo em média
  const averageMinutesPerVideo = 6;
  return videoCount * averageMinutesPerVideo * 60; // retorna em segundos
};

/**
 * Formata uma duração em segundos para um formato legível para certificados
 * PRIORIZA DURAÇÕES REAIS e aplica arredondamento inteligente
 */
export const formatDurationForCertificate = (seconds: number, videoCount: number = 0): string => {
  console.log('⏱️ [FORMAT_DURATION] Formatando duração REAL:', { seconds, videoCount });

  let finalSeconds = seconds;

  // PRIORIDADE: Se temos duração real, usar ela
  if (seconds > 0) {
    console.log('🎯 [FORMAT_DURATION] Usando duração REAL da sincronização:', seconds, 'segundos');
    finalSeconds = seconds;
  }
  // FALLBACK: Se não temos duração real mas temos contagem de vídeos, estimar
  else if (videoCount > 0) {
    finalSeconds = estimateDurationFromVideoCount(videoCount);
    console.log('🔮 [FORMAT_DURATION] Usando estimativa por contagem de vídeos:', finalSeconds, 'segundos');
  }
  // ÚLTIMO RECURSO: Duração mínima
  else {
    finalSeconds = 2 * 3600; // 2 horas mínimas
    console.log('⚠️ [FORMAT_DURATION] Usando duração mínima padrão:', finalSeconds, 'segundos');
  }

  // Converter para horas e aplicar arredondamento REALISTA
  const exactHours = finalSeconds / 3600;
  let hours: number;

  console.log('📐 [FORMAT_DURATION] Horas exatas calculadas:', exactHours);

  if (exactHours < 0.5) {
    // Menos de 30 min: 1 hora
    hours = 1;
    console.log('🕐 [FORMAT_DURATION] Menos de 30min -> arredondando para 1 hora');
  } else if (exactHours < 1) {
    // Entre 30min-1h: 1 hora
    hours = 1;
    console.log('🕐 [FORMAT_DURATION] 30min-1h -> arredondando para 1 hora');
  } else if (exactHours < 1.5) {
    // Entre 1h-1h30: 1 ou 2 horas (mais próximo)
    hours = exactHours < 1.25 ? 1 : 2;
    console.log('🕑 [FORMAT_DURATION] 1h-1h30 -> arredondando para', hours, 'hora(s)');
  } else if (exactHours < 3) {
    // Entre 1h30-3h: arredondar para múltiplos de 0.5h para mais precisão
    hours = Math.round(exactHours * 2) / 2;
    if (hours < 2) hours = 2; // Mínimo 2h para cursos substanciais
    console.log('🕑 [FORMAT_DURATION] 1h30-3h -> arredondando para', hours, 'hora(s)');
  } else {
    // Mais de 3h: arredondar para múltiplos de 1h
    hours = Math.round(exactHours);
    console.log('🕒 [FORMAT_DURATION] >3h -> arredondando para', hours, 'hora(s)');
  }
  
  console.log('✅ [FORMAT_DURATION] Resultado final:', { 
    originalSeconds: seconds,
    finalSeconds, 
    exactHours: exactHours.toFixed(2), 
    roundedHours: hours 
  });
  
  // Retornar formato adequado
  if (hours < 1) {
    const minutes = Math.ceil(finalSeconds / 60);
    const result = `${minutes} minutos`;
    console.log('📝 [FORMAT_DURATION] Retornando em minutos:', result);
    return result;
  }

  // Formato especial para horas fracionárias
  if (hours % 1 === 0.5) {
    const wholeHours = Math.floor(hours);
    const result = wholeHours > 0 
      ? `${wholeHours}h30min` 
      : '30 minutos';
    console.log('📝 [FORMAT_DURATION] Retornando formato fracionário:', result);
    return result;
  }

  const result = `${Math.floor(hours)} hora${hours > 1 ? 's' : ''}`;
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