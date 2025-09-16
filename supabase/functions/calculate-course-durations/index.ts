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

async function fetchPandaVideoDuration(videoId: string, apiKey: string): Promise<number> {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    
    try {
      console.log(`[Tentativa ${attempt}/${maxRetries}] Buscando metadados do Panda Video para ID: ${videoId}`);
      
      const url = `https://api-v2.pandavideo.com.br/videos/${videoId}`;
      console.log('📡 URL da requisição:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Status da resposta:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Erro na resposta da API do Panda: ${response.status} ${errorText}`);
        throw new Error(`Erro ao buscar vídeo: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: PandaVideoResponse = await response.json();
      console.log('✅ Dados recebidos da API:', JSON.stringify(data, null, 2));
      
      return data.video?.duration || 0;
      
    } catch (error) {
      console.log(`❌ [Tentativa ${attempt}] Erro ao buscar metadados: ${error.message}`);
      
      if (attempt === maxRetries) {
        console.log(`💥 Falha após ${maxRetries} tentativas para vídeo ${videoId}`);
        throw new Error(`Falha após ${maxRetries} tentativas: ${error.message}`);
      }
      
      const delay = 2000 * attempt;
      console.log(`⏳ Tentando novamente em ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return 0;
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

    const { courseId } = await req.json();
    
    if (!courseId) {
      return new Response(
        JSON.stringify({ error: 'Course ID é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🎯 Iniciando sincronização para curso: ${courseId}`);

    // Marcar como 'syncing'
    await supabase
      .from('course_durations')
      .update({ sync_status: 'syncing', last_sync_at: new Date().toISOString() })
      .eq('course_id', courseId);

    // Buscar vídeos do curso
    const { data: videos, error: videosError } = await supabase
      .from('learning_lesson_videos')
      .select(`
        id,
        video_id,
        duration_seconds,
        lesson_id,
        learning_lessons!inner(
          module_id,
          learning_modules!inner(
            course_id
          )
        )
      `)
      .eq('learning_lessons.learning_modules.course_id', courseId)
      .eq('type', 'panda');

    if (videosError) {
      console.error('❌ Erro ao buscar vídeos:', videosError);
      await supabase
        .from('course_durations')
        .update({ sync_status: 'failed' })
        .eq('course_id', courseId);
      
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar vídeos' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📹 Encontrados ${videos?.length || 0} vídeos do Panda Video para sincronizar`);

    const apiKey = Deno.env.get('PANDA_VIDEO_API_KEY');
    if (!apiKey) {
      console.error('❌ API Key do Panda Video não configurada');
      await supabase
        .from('course_durations')
        .update({ sync_status: 'failed' })
        .eq('course_id', courseId);
      
      return new Response(
        JSON.stringify({ error: 'API Key do Panda Video não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let totalDurationSeconds = 0;
    let syncedVideos = 0;
    const totalVideos = videos?.length || 0;

    // Processar cada vídeo
    for (const video of videos || []) {
      if (!video.video_id) {
        console.log(`⚠️ Vídeo ${video.id} sem video_id do Panda`);
        continue;
      }

      try {
        const duration = await fetchPandaVideoDuration(video.video_id, apiKey);
        
        if (duration > 0) {
          // Atualizar duração no banco
          await supabase
            .from('learning_lesson_videos')
            .update({ duration_seconds: duration })
            .eq('id', video.id);

          totalDurationSeconds += duration;
          syncedVideos++;
          
          console.log(`✅ Vídeo ${video.id}: ${duration} segundos sincronizados`);
        } else {
          console.log(`⚠️ Vídeo ${video.id}: duração não encontrada ou é 0`);
        }
      } catch (error) {
        console.log(`💥 Vídeo ${video.id}: Erro no processamento: ${error.message}`);
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

    // Atualizar registro na tabela course_durations
    const { error: updateError } = await supabase
      .from('course_durations')
      .update({
        total_duration_seconds: totalDurationSeconds,
        total_videos: totalVideos,
        synced_videos: syncedVideos,
        calculated_hours: calculatedHours,
        sync_status: syncedVideos > 0 ? 'completed' : 'failed',
        last_sync_at: new Date().toISOString()
      })
      .eq('course_id', courseId);

    if (updateError) {
      console.error('❌ Erro ao atualizar course_durations:', updateError);
    }

    console.log(`🎉 Sincronização concluída: ${syncedVideos}/${totalVideos} vídeos, ${calculatedHours} total`);

    return new Response(
      JSON.stringify({
        success: true,
        courseId,
        totalVideos,
        syncedVideos,
        totalDurationSeconds,
        calculatedHours,
        message: `Sincronização concluída: ${syncedVideos}/${totalVideos} vídeos processados`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});