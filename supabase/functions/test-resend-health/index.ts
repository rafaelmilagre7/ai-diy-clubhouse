
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface HealthCheckRequest {
  forceRefresh?: boolean;
  attempt?: number;
  timestamp?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("🔄 [HEALTH-CHECK] Recebendo requisição:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("🔄 [HEALTH-CHECK] Recebendo requisição OPTIONS - CORS Preflight");
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  if (req.method !== "POST") {
    console.log("❌ [HEALTH-CHECK] Método não permitido:", req.method);
    return new Response(
      JSON.stringify({ error: "Método não permitido" }), 
      { 
        status: 405, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }

  const startTime = Date.now();
  let requestData: HealthCheckRequest;

  try {
    // Parse request body with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout parsing request")), 5000)
    );
    
    const parsePromise = req.json().catch(() => ({}));
    requestData = await Promise.race([parsePromise, timeoutPromise]) as HealthCheckRequest;
    
    console.log("📨 [HEALTH-CHECK] Dados da requisição:", requestData);
  } catch (parseError) {
    console.error("❌ [HEALTH-CHECK] Erro ao parsear requisição:", parseError);
    requestData = {};
  }

  try {
    console.log("🔑 [HEALTH-CHECK] Verificando API key...");
    
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("❌ [HEALTH-CHECK] API key não encontrada");
      return new Response(
        JSON.stringify({
          healthy: false,
          apiKeyValid: false,
          connectivity: "error",
          domainValid: false,
          issues: ["API key do Resend não configurada"],
          lastError: "API key não encontrada",
          responseTime: Date.now() - startTime
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("✅ [HEALTH-CHECK] API key encontrada, testando conectividade...");

    // Test Resend connectivity with timeout
    const resend = new Resend(apiKey);
    
    const connectivityTest = async () => {
      try {
        // Simple API call to test connectivity
        const testResponse = await resend.domains.list();
        console.log("✅ [HEALTH-CHECK] Teste de conectividade bem-sucedido");
        return {
          success: true,
          domains: testResponse.data || []
        };
      } catch (error: any) {
        console.error("❌ [HEALTH-CHECK] Erro na conectividade:", error.message);
        return {
          success: false,
          error: error.message
        };
      }
    };

    // Add timeout to connectivity test
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout na verificação de conectividade")), 15000)
    );

    const connectivityResult = await Promise.race([
      connectivityTest(),
      timeoutPromise
    ]) as any;

    const responseTime = Date.now() - startTime;
    
    if (connectivityResult.success) {
      console.log("✅ [HEALTH-CHECK] Sistema operacional");
      return new Response(
        JSON.stringify({
          healthy: true,
          apiKeyValid: true,
          connectivity: "connected",
          domainValid: connectivityResult.domains?.length > 0,
          issues: [],
          responseTime,
          timestamp: new Date().toISOString(),
          attempt: requestData.attempt || 1
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      console.log("⚠️ [HEALTH-CHECK] Problemas detectados");
      return new Response(
        JSON.stringify({
          healthy: false,
          apiKeyValid: true, // API key exists but connectivity failed
          connectivity: "error",
          domainValid: false,
          issues: [`Erro de conectividade: ${connectivityResult.error}`],
          lastError: connectivityResult.error,
          responseTime,
          timestamp: new Date().toISOString(),
          attempt: requestData.attempt || 1
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

  } catch (error: any) {
    console.error("❌ [HEALTH-CHECK] Erro crítico:", error);
    
    const responseTime = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({
        healthy: false,
        apiKeyValid: false,
        connectivity: "error",
        domainValid: false,
        issues: [`Erro crítico: ${error.message}`],
        lastError: error.message,
        responseTime,
        timestamp: new Date().toISOString(),
        attempt: requestData.attempt || 1
      }),
      {
        status: 200, // Always return 200 for successful Edge Function execution
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
