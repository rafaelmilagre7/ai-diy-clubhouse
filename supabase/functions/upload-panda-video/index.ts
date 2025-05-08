
// Função simplificada para simular o upload do Panda Video
// Na implementação real, esta função deve fazer a integração completa com a API do Panda Video
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Configuração de CORS para permitir requisições da aplicação web
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

// Função para lidar com as requisições
serve(async (req: Request) => {
  // Lidar com preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Apenas aceitar requisições POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // Simulação de resposta bem-sucedida
    // Na integração real, aqui seria feita a comunicação com a API do Panda Video
    const mockResponse = {
      success: true,
      video: {
        id: `panda-${crypto.randomUUID()}`,
        title: "Vídeo de teste",
        url: "https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/?v=1191d81c-13eb-46b6-bba5-f302e364d0e2",
        duration: 120,
        thumbnail_url: "https://via.placeholder.com/640x360"
      }
    };
    
    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: any) {
    console.error('Erro na edge function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
