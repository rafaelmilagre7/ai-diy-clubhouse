
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
          error: "Configuração incompleta do servidor: API Key não definida"
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

    // Fazer requisição para a API do Panda Video
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Authorization": `ApiVideoPanda ${apiKey}`,
        "Accept": "application/json"
      }
    });

    console.log("Status da resposta da API do Panda:", response.status);

    if (!response.ok) {
      let errorText = "";
      try {
        const errorData = await response.json();
        errorText = errorData.message || "Erro desconhecido";
      } catch (e) {
        errorText = await response.text();
      }

      console.error("Erro da API do Panda:", errorText);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Erro ao obter vídeos: ${errorText}`
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Processar dados da resposta
    const data = await response.json();
    
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
      hls_playlist_url: video.hls_playlist_url
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
          "Content-Type": "application/json"
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
