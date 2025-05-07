
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Lidar com requisições OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar se temos a API key do Panda Video configurada
    const apiKey = Deno.env.get("PANDA_API_KEY");
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "API Key do Panda Video não está configurada"
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Verificação básica do formato da API key
    if (!apiKey.startsWith("panda-")) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "API Key do Panda Video tem formato inválido"
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Tudo parece estar correto
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Panda Video configurado corretamente"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    // Tratar erros inesperados
    console.error("Erro ao verificar configuração do Panda Video:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Erro: ${error instanceof Error ? error.message : String(error)}`
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
