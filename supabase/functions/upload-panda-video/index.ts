
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const PANDA_AUTH_URL = "https://auth.api.pandavideo.com.br/oauth2/token";
const PANDA_API_URL = "https://api.pandavideo.com.br/videos";

serve(async (req) => {
  // Lidar com requisições OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar se a requisição é POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Método não permitido" 
        }),
        { 
          status: 405, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    // Verificar autenticação do usuário (JWT)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
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

    // Obter as variáveis de ambiente necessárias
    const clientId = Deno.env.get("PANDA_CLIENT_ID");
    const clientSecret = Deno.env.get("PANDA_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      console.error("Credenciais do Panda Video não configuradas");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Configuração incompleta do servidor" 
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

    // Extrair os dados do formulário
    let formData;
    try {
      formData = await req.formData();
    } catch (formError) {
      console.error("Erro ao processar formulário:", formError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Erro ao processar os dados do formulário",
          details: formError.message 
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
    
    const videoFile = formData.get("video") as File;
    const videoTitle = formData.get("title") as string || "Vídeo sem título";
    const isPrivate = formData.get("private") === "true";

    if (!videoFile) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Nenhum arquivo de vídeo enviado" 
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

    console.log(`Processando upload do vídeo: ${videoTitle} (${videoFile.size} bytes)`);

    // 1. Autenticar com o Panda Video para obter token
    let tokenResponse;
    try {
      tokenResponse = await fetch(PANDA_AUTH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret
        })
      });
    } catch (authError) {
      console.error("Erro na requisição para autenticação:", authError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Falha na conexão com o serviço de autenticação",
          details: authError.message 
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

    if (!tokenResponse.ok) {
      let tokenErrorText;
      try {
        tokenErrorText = await tokenResponse.text();
      } catch (e) {
        tokenErrorText = "Erro desconhecido na autenticação";
      }
      
      console.error("Erro na autenticação com Panda Video:", tokenErrorText);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Falha na autenticação com o serviço de vídeo",
          details: tokenErrorText 
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

    let tokenData;
    try {
      tokenData = await tokenResponse.json();
    } catch (parseError) {
      console.error("Erro ao parsear resposta de token:", parseError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Erro ao processar resposta de autenticação",
          details: parseError.message 
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
    
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("Token de acesso não recebido:", tokenData);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Falha ao obter autorização do serviço de vídeo" 
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

    // 2. Converter o arquivo para base64
    let arrayBuffer, base64;
    try {
      arrayBuffer = await videoFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      base64 = btoa(String.fromCharCode(...bytes));
    } catch (convertError) {
      console.error("Erro ao converter vídeo para base64:", convertError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Erro ao processar o arquivo de vídeo",
          details: convertError.message 
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
    
    const mimeType = videoFile.type;
    const base64Data = `data:${mimeType};base64,${base64}`;

    // 3. Enviar o vídeo para o Panda Video
    let uploadResponse;
    try {
      uploadResponse = await fetch(PANDA_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: videoTitle,
          path: base64Data,
          private: isPrivate
        })
      });
    } catch (uploadError) {
      console.error("Erro na requisição de upload:", uploadError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Falha na conexão com o serviço de vídeo",
          details: uploadError.message 
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

    if (!uploadResponse.ok) {
      let uploadErrorText;
      try {
        uploadErrorText = await uploadResponse.text();
      } catch (e) {
        uploadErrorText = "Erro desconhecido no upload";
      }
      
      console.error("Erro no upload para Panda Video:", uploadErrorText);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Falha ao fazer upload do vídeo",
          details: uploadErrorText 
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

    let videoData;
    try {
      videoData = await uploadResponse.json();
    } catch (parseError) {
      console.error("Erro ao parsear resposta de upload:", parseError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Erro ao processar resposta do upload",
          details: parseError.message 
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
    
    console.log("Upload de vídeo bem-sucedido:", videoData);

    // 4. Retornar os dados do vídeo
    return new Response(
      JSON.stringify({
        success: true,
        video: {
          id: videoData.id,
          title: videoData.title,
          duration: videoData.duration || 0,
          url: `https://player.pandavideo.com.br/embed/${videoData.id}`,
          thumbnail_url: videoData.thumbnail_url || null,
          video_type: "panda"
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
    console.error("Erro no processamento do upload:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Erro no processamento do upload", 
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
