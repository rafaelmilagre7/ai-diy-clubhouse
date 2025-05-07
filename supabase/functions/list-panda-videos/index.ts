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

    // Obter parâmetros do corpo da requisição
    const requestData = await req.json().catch(() => ({}));
    console.log("Dados recebidos no corpo:", requestData);
    
    const page = requestData.page || "1";
    const limit = requestData.limit || "20"; 
    const search = requestData.search || "";
    const folder = requestData.folder_id || "";

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
        
        // CORREÇÃO: Formato correto do cabeçalho de autorização conforme documentação
        // Usar apenas o valor da API key no cabeçalho Authorization, sem o prefixo "ApiVideoPanda"
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
        console.log("Headers da resposta:", Object.fromEntries(response.headers.entries()));
        
        // Se a resposta for bem-sucedida, sair do loop
        if (response.ok) {
          console.log("Requisição bem-sucedida");
          break;
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
        
        // Para outros erros, capturar e tratar
        const errorText = await response.text();
        console.error(`Erro API Panda (${response.status}): ${errorText}`);
        throw new Error(`Erro API Panda (${response.status}): ${errorText}`);
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
            error: "Erro ao processar resposta do servidor Panda Video",
            rawResponseSample: responseText.substring(0, 200)
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
    } catch (readError) {
      console.error("Erro ao ler resposta como texto:", readError);
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
    
    // Verificar se a resposta contém a propriedade 'videos'
    if (!responseData || typeof responseData !== 'object' || !Array.isArray(responseData.videos)) {
      console.error("Formato de resposta inválido:", responseData);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Formato de resposta inválido da API do Panda Video",
          rawResponse: responseData
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

    console.log(`${videos.length} vídeos processados`);

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
