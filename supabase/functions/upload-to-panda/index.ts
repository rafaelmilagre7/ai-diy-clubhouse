
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const PANDA_IMPORT_URL = "https://import.pandavideo.com:9443/videos";

serve(async (req) => {
  console.log("Requisição para upload via URL recebida");
  
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
    
    console.log("API Key Panda encontrada:", apiKey.substring(0, 10) + "...");
    
    // Verificar que a chave tem o formato esperado
    if (!apiKey.startsWith('panda-')) {
      console.error("Formato da API Key do Panda Video incorreto");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Formato da API Key incorreto",
          message: "A API Key deve começar com 'panda-'"
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

    // Extrair dados da requisição
    const { title, description, url } = await req.json();
    
    if (!url || !url.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "URL do vídeo é obrigatória"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    if (!title || !title.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Título do vídeo é obrigatório"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    console.log(`Iniciando upload de vídeo por URL: "${title}"`);
    console.log("URL fornecida:", url);
    
    // Gerar um video_id UUID v4 para garantir unicidade
    const video_id = crypto.randomUUID();
    
    // Preparar o corpo da requisição para a API do Panda
    const requestBody = {
      title,
      description: description || "",
      url,
      video_id
    };

    console.log("Enviando requisição para Panda Video:", PANDA_IMPORT_URL);
    
    // Fazer a requisição para a API do Panda Video
    const response = await fetch(PANDA_IMPORT_URL, {
      method: "POST",
      headers: {
        "Authorization": apiKey, // Usar a API key diretamente no header
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    console.log("Status da resposta:", response.status);
    
    // Verificar se a resposta é bem-sucedida
    if (!response.ok) {
      let errorMessage = "Erro ao fazer upload do vídeo";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error("Erro da API Panda:", errorData);
      } catch (e) {
        console.error("Erro ao processar resposta de erro:", e);
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          status: response.status
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

    // Processar a resposta
    const responseData = await response.json();
    console.log("Resposta da API Panda:", responseData);
    
    // Construir o objeto de resposta
    const videoData = {
      success: true,
      video: {
        video_id: video_id,
        title: title,
        description: description || "",
        url: `https://player.pandavideo.com.br/embed/${video_id}`,
        thumbnail_url: null, // Será gerado pelo Panda após processamento
        duration_seconds: 0,  // Será atualizado pelo Panda após processamento
        type: "panda"
      }
    };

    return new Response(
      JSON.stringify(videoData),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Erro não tratado:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Erro ao processar a requisição",
        message: error instanceof Error ? error.message : String(error)
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
