
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const PANDA_API_URL = "https://api-v2.pandavideo.com.br";

serve(async (req) => {
  console.log("Requisição para listar vídeos do Panda recebida");
  console.log("URL da requisição:", req.url);
  console.log("Método:", req.method);
  
  // Lidar com requisições OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar autenticação do usuário (JWT)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Erro de autenticação: Token JWT ausente ou inválido");
      console.log("Headers recebidos:", Object.fromEntries([...req.headers.entries()]
        .filter(([key]) => !key.toLowerCase().includes("authorization"))));
      
      return new Response(
        JSON.stringify({
          success: false,
          error: "Usuário não autenticado",
          message: "Você precisa estar logado para acessar esta função."
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
          error: "Configuração incompleta do servidor",
          message: "A API Key do Panda Video não foi configurada no servidor."
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
    
    // Verificar se a chave tem o formato correto (começando com 'panda-')
    if (!apiKey.startsWith('panda-')) {
      console.error("Formato da API Key do Panda Video incorreto");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Configuração incorreta",
          message: "O formato da API Key do Panda Video está incorreto."
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

    // Obter parâmetros do corpo da requisição
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("Erro ao analisar corpo da requisição:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Erro na requisição",
          message: "Falha ao interpretar os parâmetros da requisição."
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
    
    console.log("Dados recebidos no corpo:", requestBody);
    
    const page = requestBody?.page || "1";
    const limit = requestBody?.limit || "20"; 
    const search = requestBody?.search || "";
    const folder = requestBody?.folder_id || "";

    console.log("Parâmetros de busca:", { page, limit, search, folder });

    // Contruir URL da API
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
        console.log(`Tentativa ${4-retriesLeft} de requisição à API Panda Video`);
        
        // Usar apenas o valor da API key no cabeçalho Authorization
        console.log(`Usando cabeçalho de autorização: ${apiKey.substring(0, 10)}...`);
        
        // Fazer requisição para a API do Panda Video com o cabeçalho correto
        response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Authorization": apiKey,
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
        
        // Tratar diferentes códigos de erro HTTP de forma amigável
        let errorMessage;
        switch(response.status) {
          case 401:
            errorMessage = "Credenciais de API inválidas. Verifique sua API Key do Panda Video.";
            break;
          case 403:
            errorMessage = "Sem permissão para acessar os vídeos. Verifique as permissões da sua conta Panda Video.";
            break;
          case 404:
            errorMessage = "Recurso não encontrado na API do Panda Video.";
            break;
          case 429:
            errorMessage = "Limite de requisições excedido. Aguarde um momento e tente novamente.";
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = "O serviço Panda Video está com problemas temporários. Tente novamente mais tarde.";
            break;
          default:
            errorMessage = `Erro na API do Panda Video (código ${response.status})`;
        }
        
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
        
        // Para outros erros, capturar e retornar uma resposta amigável
        const errorText = await response.text();
        console.error(`Erro API Panda (${response.status}): ${errorText}`);
        
        return new Response(
          JSON.stringify({
            success: false,
            error: "Erro ao comunicar com Panda Video",
            message: errorMessage,
            statusCode: response.status,
            details: errorText.substring(0, 200) // Limitar detalhes técnicos para segurança
          }),
          {
            status: 200, // Retornar 200 para o cliente, mas com flag de erro
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          }
        );
      } catch (error) {
        console.error("Erro na requisição:", error);
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
          error: "Falha na comunicação",
          message: "Não foi possível estabelecer conexão com o serviço de vídeo. Por favor, tente novamente mais tarde.",
          details: lastError?.message || "Erro desconhecido ao conectar com a API"
        }),
        {
          status: 200, // Enviar 200 mas com flag de erro para evitar erros genéricos no frontend
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Processar dados da resposta
    let responseData;
    try {
      const responseText = await response.text();
      console.log("Resposta da API do Panda (amostra):", responseText.substring(0, 200) + "...");
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Erro ao analisar resposta JSON:", parseError);
        return new Response(
          JSON.stringify({
            success: false,
            error: "Erro ao processar resposta",
            message: "A resposta do serviço de vídeo não está em um formato válido."
          }),
          {
            status: 200, // Enviar 200 para evitar erros genéricos no frontend
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          }
        );
      }
    } catch (readError) {
      console.error("Erro ao ler resposta como texto:", readError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Erro ao ler resposta",
          message: "Não foi possível ler a resposta do serviço de vídeo."
        }),
        {
          status: 200, // Enviar 200 para evitar erros genéricos no frontend
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    // Verificar se a resposta contém a propriedade 'videos'
    if (!responseData || typeof responseData !== 'object' || !Array.isArray(responseData.videos)) {
      console.error("Formato de resposta inválido:", responseData);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Formato de resposta inválido",
          message: "O serviço de vídeo retornou dados em um formato inesperado."
        }),
        {
          status: 200, // Enviar 200 para evitar erros genéricos no frontend
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    // Mapear dados para um formato mais amigável
    const videos = responseData.videos.map((video: any) => ({
      id: video.id,
      title: video.title || "Sem título",
      description: video.description || "",
      duration_seconds: video.duration_seconds || 0,
      thumbnail_url: video.thumbnail_url || null,
      created_at: video.created_at,
      folder_id: video.folder_id,
      status: video.status,
      url: `https://player.pandavideo.com.br/embed/${video.id}`
    }));

    console.log(`${videos.length} vídeos processados com sucesso`);

    return new Response(
      JSON.stringify({
        success: true,
        videos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: responseData.count || videos.length,
          totalPages: Math.ceil((responseData.count || videos.length) / parseInt(limit))
        }
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          // Cache curto para teste, mas útil para evitar muitas chamadas
          "Cache-Control": "public, max-age=30" 
        }
      }
    );
  } catch (error) {
    console.error("Erro não tratado ao listar vídeos:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Erro inesperado",
        message: "Ocorreu um erro inesperado ao processar sua solicitação. Por favor, tente novamente.",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 200, // Enviar 200 para evitar erros genéricos no frontend
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});
