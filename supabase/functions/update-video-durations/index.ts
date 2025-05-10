
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2';

// Cabeçalhos CORS para permitir chamadas do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para buscar metadados dos vídeos do Panda Video API
async function fetchPandaVideoMetadata(videoId: string) {
  try {
    console.log(`Buscando metadados do Panda Video para ID: ${videoId}`);
    
    // Obter API key do ambiente
    const pandaApiKey = Deno.env.get('PANDA_API_KEY');
    
    if (!pandaApiKey) {
      throw new Error('PANDA_API_KEY não definida');
    }
    
    // Construir URL da API
    const url = `https://api-v2.pandavideo.com.br/videos/${videoId}`;
    
    // Fazer requisição para API do Panda Video
    const response = await fetch(url, {
      headers: {
        'Authorization': pandaApiKey,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error(`Erro na resposta da API do Panda: ${response.status} ${text}`);
      throw new Error(`Erro ao buscar vídeo: ${response.status} ${response.statusText}`);
    }
    
    // Processar resposta
    const data = await response.json();
    console.log(`Obtidos metadados do Panda Video para ${videoId}`);
    
    // Retornar dados relevantes
    return {
      duration_seconds: data.duration || 0,
      thumbnail_url: data.thumbnail?.url || null,
    };
  } catch (error) {
    console.error('Erro ao buscar metadados do Panda Video:', error);
    throw error;
  }
}

// Função para atualizar a duração de um vídeo no banco de dados
async function updateVideoDuration(supabase, videoId: string, durationSeconds: number, thumbnailUrl: string | null) {
  try {
    const { data, error } = await supabase
      .from('learning_lesson_videos')
      .update({
        duration_seconds: durationSeconds,
        thumbnail_url: thumbnailUrl || undefined
      })
      .eq('id', videoId);
      
    if (error) {
      throw error;
    }
    
    return { success: true, videoId };
  } catch (error) {
    console.error(`Erro ao atualizar duração do vídeo ${videoId}:`, error);
    return { success: false, videoId, error: error.message };
  }
}

// Função para buscar vídeos sem duração
async function fetchVideosWithoutDuration(supabase) {
  const { data, error } = await supabase
    .from('learning_lesson_videos')
    .select('id, video_file_path, video_id, video_type')
    .or('duration_seconds.is.null,duration_seconds.eq.0')
    .eq('video_type', 'panda')
    .limit(20);
    
  if (error) {
    throw error;
  }
  
  return data || [];
}

// Servidor HTTP
serve(async (req) => {
  // Lidar com requisições OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    // Verificar método
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Método não permitido. Use POST.'
      }), { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variáveis de ambiente do Supabase não encontradas');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Buscar vídeos sem duração
    const videos = await fetchVideosWithoutDuration(supabase);
    console.log(`Encontrados ${videos.length} vídeos sem duração`);
    
    // Resultados das atualizações
    const results = [];
    
    // Processar cada vídeo
    for (const video of videos) {
      try {
        // Obter o ID do vídeo no Panda Video
        const pandaVideoId = video.video_id || video.video_file_path || '';
        
        if (!pandaVideoId) {
          results.push({ 
            success: false, 
            videoId: video.id, 
            error: 'ID do vídeo no Panda não encontrado' 
          });
          continue;
        }
        
        // Buscar metadados
        const metadata = await fetchPandaVideoMetadata(pandaVideoId);
        
        // Atualizar no banco de dados
        const result = await updateVideoDuration(
          supabase,
          video.id,
          metadata.duration_seconds,
          metadata.thumbnail_url
        );
        
        results.push(result);
      } catch (error) {
        console.error(`Erro ao processar vídeo ${video.id}:`, error);
        results.push({ 
          success: false, 
          videoId: video.id, 
          error: error.message 
        });
      }
    }
    
    // Retornar resultados
    return new Response(JSON.stringify({
      totalProcessed: videos.length,
      results,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // Tratar erros
    console.error('Erro na edge function:', error);
    
    return new Response(JSON.stringify({
      error: error.message || 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
