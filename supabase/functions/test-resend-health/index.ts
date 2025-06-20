
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔍 [HEALTH-CHECK] Iniciando verificação de saúde do Resend...");
    
    const apiKey = Deno.env.get("RESEND_API_KEY");
    
    // Verificar se API key existe
    if (!apiKey) {
      console.warn("⚠️ [HEALTH-CHECK] API key do Resend não configurada");
      return new Response(
        JSON.stringify({
          health: {
            apiKeyValid: false,
            apiKeyMissing: true,
            domainVerified: false,
            quotaExceeded: false,
            lastTestEmail: null,
            timestamp: new Date().toISOString(),
            message: "API key não configurada"
          }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("✅ [HEALTH-CHECK] API key encontrada, inicializando Resend...");
    
    let resend;
    try {
      resend = new Resend(apiKey);
    } catch (initError) {
      console.error("❌ [HEALTH-CHECK] Erro ao inicializar Resend:", initError);
      return new Response(
        JSON.stringify({
          health: {
            apiKeyValid: false,
            apiKeyMissing: false,
            domainVerified: false,
            quotaExceeded: false,
            lastTestEmail: null,
            error: "Erro na inicialização do Resend",
            timestamp: new Date().toISOString()
          }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Testar API key fazendo uma requisição simples
    let apiKeyValid = false;
    let domainVerified = false;
    
    try {
      console.log("🔑 [HEALTH-CHECK] Testando validade da API key...");
      
      // Tentar listar domínios para verificar se a API key é válida
      const domains = await resend.domains.list();
      console.log("✅ [HEALTH-CHECK] API key válida, domínios encontrados:", domains.data?.length || 0);
      
      apiKeyValid = true;
      
      // Verificar se o domínio viverdeia.ai está verificado
      if (domains.data && domains.data.length > 0) {
        domainVerified = domains.data.some(domain => 
          domain.name === "viverdeia.ai" && domain.status === "verified"
        );
        
        if (domainVerified) {
          console.log("✅ [HEALTH-CHECK] Domínio viverdeia.ai verificado");
        } else {
          console.warn("⚠️ [HEALTH-CHECK] Domínio viverdeia.ai não encontrado ou não verificado");
          
          // Log dos domínios disponíveis para debug
          const domainList = domains.data.map(d => `${d.name} (${d.status})`).join(", ");
          console.log("📋 [HEALTH-CHECK] Domínios disponíveis:", domainList);
        }
      } else {
        console.warn("⚠️ [HEALTH-CHECK] Nenhum domínio configurado no Resend");
      }

    } catch (apiError: any) {
      console.error("❌ [HEALTH-CHECK] Erro ao verificar API key:", apiError);
      
      // Analisar o tipo de erro
      if (apiError.message?.includes('401') || apiError.message?.includes('Unauthorized')) {
        console.error("🚫 [HEALTH-CHECK] API key inválida ou expirada");
        apiKeyValid = false;
      } else if (apiError.message?.includes('403') || apiError.message?.includes('Forbidden')) {
        console.error("🚫 [HEALTH-CHECK] API key sem permissões suficientes");
        apiKeyValid = false;
      } else {
        console.error("⚠️ [HEALTH-CHECK] Erro desconhecido, assumindo API key inválida");
        apiKeyValid = false;
      }
    }

    // Verificar quota (simulado - seria necessário endpoint específico do Resend)
    const quotaExceeded = false; // Placeholder - implementar verificação real se disponível

    const healthResult = {
      apiKeyValid,
      apiKeyMissing: false,
      domainVerified,
      quotaExceeded,
      lastTestEmail: null,
      timestamp: new Date().toISOString(),
      message: apiKeyValid ? "Sistema funcionando" : "Problemas detectados"
    };

    console.log("📊 [HEALTH-CHECK] Resultado final:", healthResult);

    return new Response(
      JSON.stringify({
        health: healthResult
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ [HEALTH-CHECK] Erro geral na verificação:", error);
    
    return new Response(
      JSON.stringify({
        health: {
          apiKeyValid: false,
          apiKeyMissing: false,
          domainVerified: false,
          quotaExceeded: false,
          lastTestEmail: null,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
