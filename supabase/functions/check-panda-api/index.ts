
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const PANDA_API_URL = "https://api-v2.pandavideo.com.br";

serve(async (req) => {
  console.log("Requisição para verificar API Panda recebida");
  
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

    console.log("API Key Panda encontrada, verificando formato");
    // Verificar se a chave tem o formato correto (começando com 'panda-')
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

    // URL para verificar a API (apenas buscar 1 vídeo para testar)
    const checkEndpoint = `${PANDA_API_URL}/videos?page=1&quantity=1`;
    console.log("URL da requisição de teste:", checkEndpoint);

    // Implementar retry para a requisição da API do Panda Video
    let retriesLeft = 2;
    let response = null;
    let lastError = null;
    
    while (retriesLeft > 0 && !response) {
      try {
        console.log(`Tentativa ${3-retriesLeft} de requisição à API Panda Video`);
        console.log(`Usando cabeçalho de autorização: ApiVideoPanda ${apiKey.substring(0, 10)}...`);
        
        // Fazer requisição para a API do Panda Video
        response = await fetch(checkEndpoint, {
          method: "GET",
          headers: {
            "Authorization": `ApiVideoPanda ${apiKey}`,
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        });
        
        console.log(`Status da resposta API: ${response.status}`);
        
        // Se a resposta for bem-sucedida, sair do loop
        if (response.ok) {
          console.log("Requisição bem-sucedida");
          break;
        }
        
        // Para erros, capturar e tratar
        const errorText = await response.text();
        console.error(`Erro API Panda (${response.status}): ${errorText}`);
        throw new Error(`Erro API Panda (${response.status}): ${errorText}`);
      } catch (error) {
        console.error("Erro na requisição:", error);
        lastError = error;
        retriesLeft--;
        
        if (retriesLeft > 0) {
          // Backoff exponencial: 1s, 2s...
          const backoffTime = Math.pow(2, 2 - retriesLeft) * 1000;
          console.error(`Erro ao acessar API do Panda. Tentando novamente em ${backoffTime}ms:`, error);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          response = null;
        }
      }
    }
    
    // Se todas as tentativas falharam
    if (!response || !response.ok) {
      console.error("Todas as tentativas falharam:", lastError);
      
      // Tentar extrair uma mensagem de erro mais útil
      let errorDetails = "Falha na comunicação com a API do Panda Video";
      let statusCode = 500;
      
      if (response) {
        statusCode = response.status;
        try {
          const errorBody = await response.text();
          try {
            const errorJson = JSON.parse(errorBody);
            errorDetails = errorJson.message || errorBody;
          } catch {
            errorDetails = errorBody.substring(0, 200);
          }
        } catch {
          errorDetails = `Erro HTTP ${response.status}`;
        }
      } else if (lastError) {
        errorDetails = lastError.message;
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: `Erro na API do Panda Video: ${errorDetails}`,
          statusCode,
        }),
        {
          status: 200, // Retornamos 200 para o frontend conseguir processar a resposta
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Analisar a resposta para garantir que é um JSON válido
    let responseData;
    try {
      responseData = await response.json();
      console.log("Resposta obtida com sucesso:", JSON.stringify(responseData).substring(0, 100) + "...");
    } catch (parseError) {
      console.error("Erro ao analisar resposta JSON:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Resposta inválida da API do Panda Video",
          details: parseError instanceof Error ? parseError.message : "Erro desconhecido"
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

    // Se chegou aqui, a API está funcionando
    return new Response(
      JSON.stringify({
        success: true,
        message: "API do Panda Video está configurada e funcionando corretamente",
        data: {
          videosCount: Array.isArray(responseData.videos) ? responseData.videos.length : 0
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
