
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// Cabeçalhos CORS para permitir chamadas do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para buscar vídeos do Panda Video API
async function fetchPandaVideos(limit = 20, page = 1) {
  try {
    console.log(`Buscando vídeos do Panda Video (page: ${page}, limit: ${limit})`);
    
    // Obter API key do ambiente
    const pandaApiKey = Deno.env.get('PANDA_API_KEY');
    
    if (!pandaApiKey) {
      throw new Error('PANDA_API_KEY não definida');
    }
    
    // Construir URL da API - CORRIGIDO: removido completamente os parâmetros que estavam causando o erro
    const url = `https://api-v2.pandavideo.com.br/videos?limit=${limit}&page=${page}`;
    
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
      throw new Error(`Erro ao buscar vídeos: ${response.status} ${response.statusText}`);
    }
    
    // Processar resposta
    const data = await response.json();
    console.log(`Obtidos ${data.videos?.length || 0} vídeos do Panda Video`);
    
    // Transformar dados para o formato esperado
    const videos = data.videos?.map((video: any) => ({
      id: video.id,
      title: video.title || 'Sem título',
      description: video.description || '',
      url: `https://player.pandavideo.com.br/embed/${video.id}`,
      thumbnail_url: video.thumbnail?.url || null,
      duration_seconds: video.duration || 0,
      created_at: video.created_at,
    })) || [];
    
    return {
      videos,
      total: data.pagination?.total || 0,
      page: data.pagination?.page || 1,
      pages: data.pagination?.pages || 1,
    };
  } catch (error) {
    console.error('Erro ao buscar vídeos do Panda Video:', error);
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
    
    // Processar parâmetros da requisição
    const { limit = 20, page = 1 } = await req.json();
    
    // Buscar vídeos
    const result = await fetchPandaVideos(limit, page);
    
    // Retornar resposta
    return new Response(JSON.stringify(result), {
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
