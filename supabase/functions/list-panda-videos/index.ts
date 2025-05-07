
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const PANDA_API_URL = "https://api-v2.pandavideo.com.br";

serve(async (req) => {
  console.log("Requisição para listar vídeos do Panda recebida");

  // Lidar com requisições OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar autenticação do usuário (JWT)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Erro de autenticação: Token JWT ausente ou inválido");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Usuário não autenticado"
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Obter API key do Panda Video
    const apiKey = Deno.env.get("PANDA_API_KEY");

    console.log("Verificando credencial Panda Video API Key disponível:", !!apiKey);

    if (!apiKey) {
      console.error("API Key do Panda Video não configurada");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Configuração incompleta do servidor: API Key não definida",
          message: "Por favor, configure a variável de ambiente PANDA_API_KEY no Supabase"
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Parâmetros opcionais
    const url = new URL(req.url);
    const page = url.searchParams.get("page") || "1";
    const limit = url.searchParams.get("limit") || "100";
    const search = url.searchParams.get("search") || "";
    const folder = url.searchParams.get("folder") || "";

    // Construir URL de consulta
    let apiUrl = `${PANDA_API_URL}/videos?page=${page}&quantity=${limit}`;
    
    if (search) {
      apiUrl += `&search=${encodeURIComponent(search)}`;
    }
    
    if (folder) {
      apiUrl += `&folder=${encodeURIComponent(folder)}`;
    }

    console.log("URL da API do Panda:", apiUrl);

    // Implementar retry para a requisição da API do Panda Video
    let retriesLeft = 3;
    let response = null;
    let lastError = null;
    
    while (retriesLeft > 0 && !response) {
      try {
        // Fazer requisição para a API do Panda Video
        response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Authorization": `ApiVideoPanda ${apiKey}`,
            "Accept": "application/json"
          }
        });
        
        console.log("Status da resposta da API do Panda:", response.status);
        console.log("Headers da resposta:", Object.fromEntries(response.headers.entries()));
        
        // Se a resposta for bem-sucedida, sair do loop
        if (response.ok) break;
        
        // Se receber um erro de rate limit, tentar novamente
        if (response.status === 429) {
          retriesLeft--;
          const retryAfter = response.headers.get("Retry-After") || "2";
          const waitTime = parseInt(retryAfter, 10) * 1000;
          
          console.log(`Rate limit atingido. Tentando novamente em ${waitTime}ms. Tentativas restantes: ${retriesLeft}`);
          
          // Esperar antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, waitTime));
          response = null;
          continue;
        }
        
        // Para outros erros, capturar e tratar
        const errorText = await response.text();
        console.error(`Erro API Panda (${response.status}): ${errorText}`);
        throw new Error(`Erro API Panda (${response.status}): ${errorText}`);
      } catch (error) {
        lastError = error;
        retriesLeft--;
        
        if (retriesLeft > 0) {
          // Backoff exponencial: 1s, 2s, 4s...
          const backoffTime = Math.pow(2, 3 - retriesLeft) * 1000;
          console.error(`Erro ao acessar API do Panda. Tentando novamente em ${backoffTime}ms:`, error);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          response = null;
        }
      }
    }
    
    // Se todas as tentativas falharam
    if (!response || !response.ok) {
      console.error("Todas as tentativas falharam:", lastError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Erro ao obter vídeos: ${lastError?.message || "Falha na comunicação com a API do Panda Video"}`,
          retriesAttempted: 3 - retriesLeft
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Processar dados da resposta
    let responseText;
    try {
      responseText = await response.text();
      console.log("Resposta bruta da API do Panda:", responseText);
    } catch (parseError) {
      console.error("Erro ao ler resposta como texto:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Erro ao ler resposta da API do Panda Video"
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    // Tentar fazer parse da resposta como JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Erro ao analisar resposta JSON:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Erro ao processar resposta do servidor Panda Video",
          rawResponse: responseText
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    // Verificar se a resposta contém a propriedade 'videos'
    if (!data || !data.videos) {
      console.error("Formato de resposta inválido:", data);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Formato de resposta inválido da API do Panda Video",
          rawResponse: data
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    // Mapear dados para um formato mais amigável
    const videos = data.videos.map((video: any) => ({
      id: video.id,
      title: video.title || "Sem título",
      description: video.description || "",
      duration_seconds: video.duration_seconds || 0,
      thumbnail_url: video.thumbnail_url || null,
      created_at: video.created_at,
      folder_id: video.folder_id,
      status: video.status,
      hls_playlist_url: video.hls_playlist_url,
      url: `https://player.pandavideo.com.br/embed/${video.id}`
    }));

    return new Response(
      JSON.stringify({
        success: true,
        videos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: data.count || videos.length,
          totalPages: Math.ceil((data.count || videos.length) / parseInt(limit))
        }
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          // Adicionar cache para evitar chamadas repetidas
          "Cache-Control": "public, max-age=60" // 1 minuto de cache
        }
      }
    );
  } catch (error) {
    console.error("Erro não tratado ao listar vídeos:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Erro ao processar a requisição",
        message: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});
