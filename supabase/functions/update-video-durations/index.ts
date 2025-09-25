
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2';

// Cabeçalhos CORS para permitir chamadas do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting e retry configs
const RATE_LIMIT_DELAY = 1000; // 1 segundo entre requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 segundos entre tentativas

// Função para buscar metadados dos vídeos do Panda Video API com retry
async function fetchPandaVideoMetadata(videoId: string): Promise<{ duration_seconds: number; thumbnail_url: string | null }> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Tentativa ${attempt}/${MAX_RETRIES}] Buscando metadados do Panda Video para ID: ${videoId}`);
      
      // Obter API key do ambiente (nome atualizado)
      const pandaApiKey = Deno.env.get('PANDA_VIDEO_API_KEY');
      
      if (!pandaApiKey) {
        throw new Error('PANDA_VIDEO_API_KEY não definida nas variáveis de ambiente');
      }
      
      console.log('✅ API Key encontrada, fazendo requisição...');
      
      // Construir URL da API conforme documentação oficial
      const url = `https://api-v2.pandavideo.com.br/videos/${videoId}`;
      console.log(`📡 URL da requisição: ${url}`);
      
      // Fazer requisição para API do Panda Video seguindo documentação
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': pandaApiKey,  // Conforme documentação: Authorization: API_KEY
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      
      console.log(`📊 Status da resposta: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const text = await response.text();
        console.error(`❌ Erro na resposta da API do Panda: ${response.status} ${text}`);
        
        // Se for 401, é problema de autenticação - não tentar novamente
        if (response.status === 401) {
          throw new Error(`Erro de autenticação com a API do Panda Video. Verifique a PANDA_VIDEO_API_KEY.`);
        }
        
        // Se for 429 ou 5xx, pode ser temporário - tentar novamente
        if (attempt < MAX_RETRIES && (response.status === 429 || response.status >= 500)) {
          console.log(`⏳ Erro temporário (${response.status}), tentando novamente em ${RETRY_DELAY}ms...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          continue;
        }
        
        throw new Error(`Erro ao buscar vídeo: ${response.status} ${response.statusText} - ${text}`);
      }
      
      // Processar resposta
      const data = await response.json();
      
      console.log(`=== RESPOSTA DA API PANDA PARA ${videoId} ===`);
      console.log('Estrutura dos dados:', Object.keys(data));
      
      // Extrair duração - verificar campos mais prováveis primeiro
      let durationSeconds = 0;
      
      // Campos ordenados por probabilidade baseado na API do Panda Video
      const durationFields = [
        'duration',           // Campo mais comum
        'length',            // Campo alternativo
        'duration_seconds',  // Possível campo direto
        'time',             // Campo de tempo genérico
        'video_duration',   // Campo específico de vídeo
        'media_duration',   // Campo de mídia
        'duration_in_seconds' // Variação do campo
      ];
      
      for (const field of durationFields) {
        if (data[field] !== undefined && data[field] !== null) {
          let value = data[field];
          
          // Converter string para número se necessário
          if (typeof value === 'string') {
            value = parseFloat(value);
          }
          
          if (typeof value === 'number' && !isNaN(value) && value > 0) {
            durationSeconds = Math.round(value);
            console.log(`✅ Duração encontrada no campo '${field}': ${durationSeconds} segundos (${Math.round(durationSeconds/60)} min)`);
            break;
          }
        }
      }
      
      // Extrair thumbnail
      let thumbnailUrl = null;
      if (data.thumbnail) {
        if (typeof data.thumbnail === 'string') {
          thumbnailUrl = data.thumbnail;
        } else if (typeof data.thumbnail === 'object') {
          thumbnailUrl = data.thumbnail.url || data.thumbnail.src || data.thumbnail.image || null;
        }
        if (thumbnailUrl) {
          console.log(`📷 Thumbnail encontrada: ${thumbnailUrl}`);
        }
      }
      
      const result = {
        duration_seconds: durationSeconds,
        thumbnail_url: thumbnailUrl,
      };
      
      console.log(`✅ Resultado processado para ${videoId}:`, result);
      
      // Rate limiting para não sobrecarregar a API
      if (RATE_LIMIT_DELAY > 0) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ [Tentativa ${attempt}] Erro ao buscar metadados:`, error instanceof Error ? error.message : 'Unknown error');
      
      // Se não for o último attempt, tentar novamente
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Tentando novamente em ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        continue;
      }
      
      // Último attempt falhou
      throw new Error(`Falha após ${MAX_RETRIES} tentativas: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  throw new Error(`Erro inesperado no fetch de metadados para ${videoId}`);
}

// Função para atualizar a duração de um vídeo no banco de dados
async function updateVideoDuration(supabase: any, videoId: string, durationSeconds: number, thumbnailUrl: string | null) {
  try {
    const { error } = await supabase
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
    return { success: false, videoId, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Função para buscar vídeos sem duração
async function fetchVideosWithoutDuration(supabase: any, lessonId?: string, courseId?: string, limit: number = 50) {
  try {
    let query = supabase
      .from('learning_lesson_videos')
      .select('id, video_file_path, video_id, video_type, lesson_id')
      .or('duration_seconds.is.null,duration_seconds.eq.0')
      .eq('video_type', 'panda')
      .limit(limit);
    
    // Se um ID de aula foi especificado, filtrar apenas os vídeos dessa aula
    if (lessonId) {
      query = query.eq('lesson_id', lessonId);
    } 
    // Se um ID de curso foi especificado, precisamos fazer um join complexo
    else if (courseId) {
      // Primeiro obtemos todas as aulas do curso
      const { data: lessons, error: lessonsError } = await supabase
        .from('learning_lessons')
        .select('id')
        .eq('module.course_id', courseId)
        .select(`
          id,
          module:module_id (
            course_id
          )
        `);
      
      if (lessonsError) {
        console.error('Erro ao buscar aulas do curso:', lessonsError);
        throw lessonsError;
      }
      
      if (lessons && lessons.length > 0) {
        const lessonIds = lessons.map((lesson: any) => lesson.id);
        query = query.in('lesson_id', lessonIds);
      } else {
        // Se não encontramos aulas, retornar array vazio
        return [];
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar vídeos sem duração:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar vídeos sem duração:', error);
    throw error;
  }
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
    
    // Obter parâmetros da requisição
    let lessonId, courseId;
    
    if (req.body) {
      try {
        const body = await req.json();
        lessonId = body.lessonId;
        courseId = body.courseId;
        
        // Log de depuração para ajudar a identificar problemas
        console.log(`Solicitação recebida para: ${lessonId ? `aula ${lessonId}` : courseId ? `curso ${courseId}` : 'todos os vídeos'}`);
      } catch (e) {
        // Ignorar erro se o body não for um JSON válido
        console.log('Requisição sem body ou com body inválido');
      }
    }
    
    // Buscar vídeos sem duração
    const videos = await fetchVideosWithoutDuration(supabase, lessonId, courseId);
    console.log(`Encontrados ${videos.length} vídeos sem duração`);
    
    if (videos.length === 0) {
      return new Response(JSON.stringify({
        totalProcessed: 0,
        results: [],
        success: 0,
        failed: 0,
        message: lessonId ? 
          "Nenhum vídeo sem duração encontrado para esta aula" : 
          "Nenhum vídeo sem duração encontrado"
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Resultados das atualizações
    const results = [];
    
    console.log(`🚀 Iniciando processamento de ${videos.length} vídeos`);
    let processedCount = 0;
    
    // Processar cada vídeo com controle de progresso
    for (const video of videos) {
      try {
        processedCount++;
        console.log(`\n📹 [${processedCount}/${videos.length}] Processando vídeo ${video.id}`);
        
        // Obter o ID do vídeo no Panda Video
        const pandaVideoId = video.video_id || video.video_file_path || '';
        
        if (!pandaVideoId) {
          console.log(`⚠️ Vídeo ${video.id}: ID do Panda Video não encontrado`);
          results.push({ 
            success: false, 
            videoId: video.id, 
            error: 'ID do vídeo no Panda não encontrado' 
          });
          continue;
        }
        
        console.log(`🔍 Vídeo ${video.id}: Buscando metadados para Panda ID: ${pandaVideoId}`);
        
        // Buscar metadados com retry automático
        const metadata = await fetchPandaVideoMetadata(pandaVideoId);
        
        if (metadata.duration_seconds > 0) {
          console.log(`⏱️ Vídeo ${video.id}: Duração obtida: ${metadata.duration_seconds}s (${Math.round(metadata.duration_seconds/60)} min)`);
        } else {
          console.log(`⚠️ Vídeo ${video.id}: Duração não disponível na API`);
        }
        
        // Atualizar no banco de dados
        const result = await updateVideoDuration(
          supabase,
          video.id,
          metadata.duration_seconds,
          metadata.thumbnail_url
        );
        
        if (result.success) {
          console.log(`✅ Vídeo ${video.id}: Atualizado no banco de dados`);
        } else {
          console.log(`❌ Vídeo ${video.id}: Erro no banco: ${result.error}`);
        }
        
        results.push(result);
        
      } catch (error) {
        console.error(`💥 Vídeo ${video.id}: Erro no processamento:`, error instanceof Error ? error.message : 'Unknown error');
        results.push({ 
          success: false, 
          videoId: video.id, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Calcular estatísticas
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;
    
    console.log(`Processamento concluído: ${successCount} sucesso, ${failedCount} falhas`);
    
    // Retornar resultados
    return new Response(JSON.stringify({
      totalProcessed: videos.length,
      results,
      success: successCount,
      failed: failedCount
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // Tratar erros
    console.error('Erro na edge function:', error);
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
