import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PandaVideoResponse {
  video: {
    video_id: string;
    duration: number; // Duração em segundos
  };
}

interface ProcessingStats {
  totalProcessed: number;
  successful: number;
  failed: number;
  skipped: number;
}

async function fetchPandaVideoDuration(videoId: string, apiKey: string): Promise<number | null> {
  const maxRetries = 2; // Reduzir tentativas para ser mais rápido
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    
    try {
      console.log(`[Tentativa ${attempt}/${maxRetries}] Buscando: ${videoId}`);
      
      const response = await fetch(`https://api-v2.pandavideo.com.br/videos/${videoId}`, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000) // Timeout de 8s por tentativa
      });

      if (response.status === 404) {
        console.log(`⚠️ Vídeo ${videoId} não encontrado no Panda (404) - pulando`);
        return null; // Vídeo não existe, pular
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: PandaVideoResponse = await response.json();
      const duration = data.video?.duration || 0;
      
      console.log(`✅ ${videoId}: ${duration}s`);
      return duration;
      
    } catch (error: any) {
      console.log(`❌ [Tentativa ${attempt}] ${videoId}: ${error.message}`);
      
      if (attempt === maxRetries) {
        if (error.name === 'TimeoutError') {
          console.log(`⏱️ Timeout para ${videoId} - assumindo 300s`);
          return 300; // 5 minutos como estimativa para timeouts
        }
        return null; // Falhou definitivamente
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  return null;
}

async function processCourseOptimized(courseId: string, supabase: any): Promise<any> {
  try {
    console.log(`🚀 Processando curso: ${courseId}`);

    // Buscar vídeos do curso com query corrigida
    const { data: videos, error: videosError } = await supabase
      .from('learning_lesson_videos')
      .select(`
        id,
        video_id,
        duration_seconds,
        lesson_id,
        lesson:learning_lessons!inner(
          id,
          title,
          module:learning_modules!inner(
            course_id,
            course:learning_courses!inner(title)
          )
        )
      `)
      .eq('lesson.module.course_id', courseId)
      .eq('video_type', 'panda')
      .not('video_id', 'is', null);

    if (videosError) {
      console.error('❌ Erro ao buscar vídeos:', videosError);
      return { success: false, error: `Erro na query: ${videosError.message}` };
    }

    const totalVideos = videos?.length || 0;
    console.log(`📹 Encontrados ${totalVideos} vídeos para sincronizar`);

    if (totalVideos === 0) {
      console.log('ℹ️ Nenhum vídeo encontrado para sincronização');
      // Criar/atualizar registro mesmo sem vídeos
      await supabase
        .from('course_durations')
        .upsert({
          course_id: courseId,
          total_duration_seconds: 0,
          total_videos: 0,
          synced_videos: 0,
          calculated_hours: '0min',
          sync_status: 'completed',
          last_sync_at: new Date().toISOString()
        }, { onConflict: 'course_id' });
        
      return { 
        success: true, 
        courseId,
        totalVideos: 0,
        syncedVideos: 0,
        totalDurationSeconds: 0,
        calculatedHours: '0min'
      };
    }

    const apiKey = Deno.env.get('PANDA_VIDEO_API_KEY');
    if (!apiKey) {
      console.error('❌ PANDA_VIDEO_API_KEY não configurada');
      return { success: false, error: 'API Key do Panda Video não configurada' };
    }

    let stats: ProcessingStats = { totalProcessed: 0, successful: 0, failed: 0, skipped: 0 };
    let totalDurationSeconds = 0;
    
    // Processar em lotes de 5 vídeos para evitar sobrecarga
    const batchSize = 5;
    const videoGroups = [];
    
    for (let i = 0; i < videos.length; i += batchSize) {
      videoGroups.push(videos.slice(i, i + batchSize));
    }

    console.log(`📦 Processando ${videoGroups.length} lotes de até ${batchSize} vídeos`);

    for (let batchIndex = 0; batchIndex < videoGroups.length; batchIndex++) {
      const batch = videoGroups[batchIndex];
      console.log(`\n📦 Lote ${batchIndex + 1}/${videoGroups.length} (${batch.length} vídeos)`);
      
      // Processar lote em paralelo
      const batchPromises = batch.map(async (video, index) => {
        stats.totalProcessed++;
        console.log(`\n📹 [${stats.totalProcessed}/${totalVideos}] ${video.id}`);
        
        try {
          const duration = await fetchPandaVideoDuration(video.video_id, apiKey);
          
          if (duration === null) {
            stats.skipped++;
            return { video, duration: 0, updated: false };
          }
          
          if (duration > 0) {
            // Atualizar no banco
            const { error: updateError } = await supabase
              .from('learning_lesson_videos')
              .update({ 
                duration_seconds: duration,
                updated_at: new Date().toISOString()
              })
              .eq('id', video.id);

            if (updateError) {
              console.error(`❌ Erro ao atualizar ${video.id}:`, updateError);
              stats.failed++;
              return { video, duration: 0, updated: false };
            }

            stats.successful++;
            console.log(`✅ ${video.id}: ${duration}s atualizado`);
            return { video, duration, updated: true };
          } else {
            stats.skipped++;
            return { video, duration: 0, updated: false };
          }
        } catch (error: any) {
          stats.failed++;
          console.log(`💥 ${video.id}: ${error.message}`);
          return { video, duration: 0, updated: false };
        }
      });
      
      // Aguardar conclusão do lote
      const batchResults = await Promise.all(batchPromises);
      
      // Somar durações do lote
      batchResults.forEach(result => {
        if (result.updated) {
          totalDurationSeconds += result.duration;
        }
      });
      
      console.log(`📦 Lote ${batchIndex + 1} concluído - Total acumulado: ${Math.floor(totalDurationSeconds / 60)}min`);
      
      // Pequeno delay entre lotes para não sobrecarregar API
      if (batchIndex < videoGroups.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Calcular horas formatadas
    const hours = Math.floor(totalDurationSeconds / 3600);
    const minutes = Math.floor((totalDurationSeconds % 3600) / 60);
    
    let calculatedHours = '';
    if (hours > 0 && minutes > 0) {
      calculatedHours = `${hours}h ${minutes}min`;
    } else if (hours > 0) {
      calculatedHours = `${hours}h`;
    } else if (minutes > 0) {
      calculatedHours = `${minutes}min`;
    } else {
      calculatedHours = '0min';
    }

    // Atualizar course_durations
    const { error: updateError } = await supabase
      .from('course_durations')
      .upsert({
        course_id: courseId,
        total_duration_seconds: totalDurationSeconds,
        total_videos: totalVideos,
        synced_videos: stats.successful,
        calculated_hours: calculatedHours,
        sync_status: stats.successful > 0 ? 'completed' : 'failed',
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'course_id' });

    if (updateError) {
      console.error('❌ Erro ao atualizar course_durations:', updateError);
    }

    console.log(`\n🎉 RESUMO - Curso ${courseId}:`);
    console.log(`   ✅ Sucessos: ${stats.successful}`);
    console.log(`   ❌ Falhas: ${stats.failed}`);
    console.log(`   ⏭️ Pulados: ${stats.skipped}`);
    console.log(`   ⏱️ Duração total: ${calculatedHours}`);

    return {
      success: true,
      courseId,
      totalVideos,
      syncedVideos: stats.successful,
      totalDurationSeconds,
      calculatedHours,
      stats,
      message: `${stats.successful}/${totalVideos} vídeos sincronizados, ${calculatedHours} total`
    };
  } catch (error: any) {
    console.error(`💥 Erro crítico no curso ${courseId}:`, error);
    
    // Marcar como falha no banco
    try {
      await supabase
        .from('course_durations')
        .upsert({
          course_id: courseId,
          sync_status: 'failed',
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'course_id' });
    } catch (dbError) {
      console.error('❌ Erro ao marcar falha no banco:', dbError);
    }

    return { success: false, courseId, error: error.message };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json().catch(() => ({}));
    const { courseId, syncAll } = body;
    
    if (!courseId && !syncAll) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Parâmetro courseId ou syncAll é obrigatório' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (syncAll) {
      console.log(`🎯 === SINCRONIZAÇÃO GLOBAL INICIADA ===`);
      
      // Buscar todos os cursos publicados
      const { data: courses, error: coursesError } = await supabase
        .from('learning_courses')
        .select('id, title')
        .eq('published', true);

      if (coursesError) {
        console.error('❌ Erro ao buscar cursos:', coursesError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Erro ao buscar cursos: ${coursesError.message}` 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const totalCourses = courses?.length || 0;
      console.log(`📚 Encontrados ${totalCourses} cursos para sincronizar`);

      let globalStats = {
        totalCourses,
        processedCourses: 0,
        successfulCourses: 0,
        failedCourses: 0,
        totalVideosSynced: 0,
        totalDuration: 0
      };

      // Processar cursos sequencialmente para evitar sobrecarga
      for (let i = 0; i < totalCourses; i++) {
        const course = courses[i];
        
        try {
          console.log(`\n🎓 [${i + 1}/${totalCourses}] Processando: ${course.title}`);
          
          const result = await processCourseOptimized(course.id, supabase);
          
          globalStats.processedCourses++;
          
          if (result.success) {
            globalStats.successfulCourses++;
            globalStats.totalVideosSynced += result.syncedVideos || 0;
            globalStats.totalDuration += result.totalDurationSeconds || 0;
          } else {
            globalStats.failedCourses++;
            console.error(`❌ Falha no curso ${course.title}:`, result.error);
          }
        } catch (error: any) {
          globalStats.processedCourses++;
          globalStats.failedCourses++;
          console.error(`💥 Erro crítico no curso ${course.title}:`, error);
        }
        
        // Pequeno delay entre cursos
        if (i < totalCourses - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      const totalHours = Math.floor(globalStats.totalDuration / 3600);
      const totalMinutes = Math.floor((globalStats.totalDuration % 3600) / 60);
      const formattedTotal = totalHours > 0 ? `${totalHours}h ${totalMinutes}min` : `${totalMinutes}min`;

      console.log(`\n🎉 === SINCRONIZAÇÃO GLOBAL CONCLUÍDA ===`);
      console.log(`📊 Cursos processados: ${globalStats.processedCourses}/${globalStats.totalCourses}`);
      console.log(`✅ Sucessos: ${globalStats.successfulCourses}`);
      console.log(`❌ Falhas: ${globalStats.failedCourses}`);
      console.log(`🎬 Vídeos sincronizados: ${globalStats.totalVideosSynced}`);
      console.log(`⏱️ Duração total: ${formattedTotal}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Sincronização concluída: ${globalStats.successfulCourses}/${globalStats.totalCourses} cursos`,
          globalStats,
          totalFormattedDuration: formattedTotal
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Processar curso individual
    console.log(`🎯 Sincronização individual para curso: ${courseId}`);
    const result = await processCourseOptimized(courseId, supabase);
    
    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('💥 ERRO CRÍTICO GLOBAL:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Erro interno: ${error.message}`,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});