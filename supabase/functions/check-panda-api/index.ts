
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const PANDA_API_URL = "https://api-v2.pandavideo.com.br";

serve(async (req) => {
  console.log("Requisição para verificar status da API Panda recebida");
  
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

    console.log("Testando comunicação com API Panda Video...");
    
    // Testar conexão com a API do Panda Video
    // Faremos uma requisição simples para verificar se está funcionando
    const response = await fetch(`${PANDA_API_URL}/videos?limit=1`, {
      method: "GET",
      headers: {
        "Authorization": apiKey, // Usar a API key diretamente no header
        "Content-Type": "application/json"
      }
    });

    console.log(`Status da resposta: ${response.status}`);
    
    if (!response.ok) {
      let errorMessage = "Falha na comunicação com a API do Panda Video";
      
      try {
        const errorData = await response.json();
        console.error("Detalhes do erro:", errorData);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // Erro ao processar a resposta, ignorar
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          status: response.status,
          details: "Verifique se a API Key está configurada corretamente"
        }),
        {
          status: 200, // Retornamos 200 mesmo em caso de erro para o frontend poder exibir a mensagem
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Se chegou até aqui, a API está funcionando
    return new Response(
      JSON.stringify({
        success: true,
        message: "Integração com Panda Video está funcionando corretamente"
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
        error: "Erro ao verificar status da API",
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
