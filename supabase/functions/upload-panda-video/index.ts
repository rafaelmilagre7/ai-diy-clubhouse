import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const PANDA_AUTH_URL = "https://auth.api.pandavideo.com.br/oauth2/token";
const PANDA_API_URL = "https://api.pandavideo.com.br/videos";

// Implementar sistema de retry para falhas de autenticação
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Tentativa ${attempt + 1} de ${maxRetries} para: ${url}`);
        // Espera exponencial entre tentativas (1s, 2s, 4s...)
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
      
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.error(`Erro na tentativa ${attempt + 1}:`, error);
      lastError = error;
    }
  }
  
  throw new Error(`Falha após ${maxRetries} tentativas: ${lastError?.message || 'Erro desconhecido'}`);
}

serve(async (req) => {
  console.log("Requisição de upload de vídeo recebida");
  
  // Lidar com requisições OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar se a requisição é POST
    if (req.method !== "POST") {
      console.log("Método não permitido:", req.method);
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

    // Obter as variáveis de ambiente necessárias
    const clientId = Deno.env.get("PANDA_CLIENT_ID");
    const clientSecret = Deno.env.get("PANDA_CLIENT_SECRET");
    
    console.log("Verificando credenciais Panda Video: Client ID disponível:", !!clientId);
    console.log("Verificando credenciais Panda Video: Client Secret disponível:", !!clientSecret);
    
    if (!clientId || !clientSecret) {
      console.error("Credenciais do Panda Video não configuradas");
      console.error("Client ID disponível:", !!clientId);
      console.error("Client Secret disponível:", !!clientSecret);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Configuração incompleta do servidor: credenciais não definidas",
          details: {
            clientIdPresent: !!clientId,
            clientSecretPresent: !!clientSecret
          }
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
      console.log("FormData extraído com sucesso");
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
      console.log("Nenhum arquivo de vídeo encontrado no FormData");
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
    console.log(`Tipo do arquivo: ${videoFile.type}`);

    // 1. Autenticar com o Panda Video para obter token
    console.log("Iniciando autenticação com Panda Video API");
    console.log("Usando credenciais: ID=" + clientId.substring(0, 3) + "..." + (clientId.length > 6 ? clientId.substring(clientId.length - 3) : ""));
      
    let tokenResponse;
    try {
      const authBody = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret
      });
      
      console.log("Enviando solicitação de autenticação para:", PANDA_AUTH_URL);
      
      tokenResponse = await fetchWithRetry(PANDA_AUTH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: authBody
      });
      
      console.log("Resposta de autenticação recebida: Status", tokenResponse.status);
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
        console.error("Resposta de erro do serviço de autenticação:", tokenErrorText);
      } catch (e) {
        tokenErrorText = "Erro desconhecido na autenticação";
        console.error("Não foi possível ler resposta de erro da autenticação:", e);
      }
      
      // Analisar se é um problema de credenciais
      const isCredentialProblem = tokenErrorText.includes('invalid_client') || 
                                 tokenErrorText.includes('unauthorized') ||
                                 tokenResponse.status === 401;
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: isCredentialProblem 
            ? "Credenciais de API inválidas. Verifique as chaves Panda Video."
            : "Falha na autenticação com o serviço de vídeo",
          details: tokenErrorText,
          status: tokenResponse.status
        }),
        { 
          status: isCredentialProblem ? 401 : 500, 
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
      console.log("Token de acesso obtido com sucesso");
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
          error: "Falha ao obter autorização do serviço de vídeo",
          tokenResponse: tokenData
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
    console.log("Convertendo vídeo para base64...");
    let arrayBuffer, base64;
    try {
      arrayBuffer = await videoFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      base64 = btoa(String.fromCharCode(...bytes));
      console.log(`Conversão base64 concluída. Tamanho após codificação: ${base64.length} caracteres`);
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
    
    const mimeType = videoFile.type || "video/mp4";
    const base64Data = `data:${mimeType};base64,${base64}`;

    // 3. Enviar o vídeo para o Panda Video
    console.log("Enviando vídeo para a API do Panda Video...");
    let uploadResponse;
    try {
      uploadResponse = await fetchWithRetry(PANDA_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          title: videoTitle,
          path: base64Data,
          private: isPrivate
        })
      });
      
      console.log(`Resposta do Panda Video API recebida com status: ${uploadResponse.status}`);
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
      // Clonar a resposta para poder lê-la mais de uma vez se necessário
      const clonedResponse = uploadResponse.clone();
      
      let uploadErrorText;
      try {
        uploadErrorText = await clonedResponse.text();
        console.error("Erro no upload para Panda Video:", uploadErrorText);
      } catch (e) {
        uploadErrorText = "Erro desconhecido no upload";
        console.error("Não foi possível ler resposta de erro:", e);
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Falha ao fazer upload do vídeo",
          details: uploadErrorText,
          statusCode: uploadResponse.status
        }),
        { 
          status: uploadResponse.status, 
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
      console.log("Upload de vídeo bem-sucedido:", videoData);
    } catch (parseError) {
      console.error("Erro ao parsear resposta de upload:", parseError, "Status:", uploadResponse.status);
      
      // Tentar ler como texto para diagnóstico
      try {
        const responseText = await uploadResponse.text();
        console.error("Resposta não-JSON recebida:", responseText);
        
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Resposta inválida do servidor de vídeo",
            details: "A resposta não é um JSON válido", 
            responseText: responseText.substring(0, 200) // Enviar parte da resposta para diagnóstico
          }),
          { 
            status: 500, 
            headers: { 
              ...corsHeaders, 
              "Content-Type": "application/json" 
            } 
          }
        );
      } catch (textError) {
        console.error("Não foi possível ler a resposta como texto:", textError);
        
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
    }
    
    if (!videoData || !videoData.id) {
      console.error("Dados do vídeo incompletos ou ausentes na resposta:", videoData);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Dados do vídeo incompletos na resposta do servidor",
          received: videoData
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

    // 4. Retornar os dados do vídeo
    console.log("Retornando dados do vídeo para o cliente");
    
    // Adicionar mais logs para diagnóstico
    console.log("Função Edge Function upload-panda-video completada com sucesso");
    
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
    console.error("Erro não tratado no processamento do upload:", error);
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
