
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
    const apiKey = Deno.env.get("RESEND_API_KEY");
    
    // Verificar se API key existe
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          health: {
            apiKeyValid: false,
            apiKeyMissing: true,
            domainVerified: false,
            quotaExceeded: false,
            lastTestEmail: null
          }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const resend = new Resend(apiKey);

    // Verificar domínios configurados
    let domainVerified = false;
    try {
      const domains = await resend.domains.list();
      domainVerified = domains.data?.some(domain => 
        domain.name === "viverdeia.ai" && domain.status === "verified"
      ) || false;
    } catch (error) {
      console.log("Erro ao verificar domínios:", error);
    }

    return new Response(
      JSON.stringify({
        health: {
          apiKeyValid: true,
          apiKeyMissing: false,
          domainVerified,
          quotaExceeded: false, // Simplificado - em produção poderia verificar quota real
          lastTestEmail: null,
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Erro na verificação de saúde do Resend:", error);
    
    return new Response(
      JSON.stringify({
        health: {
          apiKeyValid: false,
          apiKeyMissing: false,
          domainVerified: false,
          quotaExceeded: false,
          lastTestEmail: null,
          error: error.message
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
