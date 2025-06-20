
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-function-timeout",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface HealthCheckRequest {
  forceRefresh?: boolean;
  attempt?: number;
  timestamp?: string;
  testType?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🔄 [HEALTH-${requestId}] Nova requisição: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log(`🔄 [HEALTH-${requestId}] CORS Preflight - respondendo`);
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  if (req.method !== "POST") {
    console.log(`❌ [HEALTH-${requestId}] Método não permitido: ${req.method}`);
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
    console.log(`📨 [HEALTH-${requestId}] Processando requisição POST...`);
    
    // Parse request body com timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout parsing request")), 5000)
    );
    
    const parsePromise = req.json().catch(() => ({}));
    requestData = await Promise.race([parsePromise, timeoutPromise]) as HealthCheckRequest;
    
    console.log(`📊 [HEALTH-${requestId}] Dados recebidos:`, {
      ...requestData,
      requestId,
      userAgent: req.headers.get('user-agent')?.substring(0, 100),
      clientInfo: req.headers.get('x-client-info')
    });
  } catch (parseError) {
    console.error(`❌ [HEALTH-${requestId}] Erro ao parsear:`, parseError);
    requestData = {};
  }

  try {
    console.log(`🔑 [HEALTH-${requestId}] Verificando configurações...`);
    
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error(`❌ [HEALTH-${requestId}] API key não configurada`);
      return new Response(
        JSON.stringify({
          healthy: false,
          apiKeyValid: false,
          connectivity: "error",
          domainValid: false,
          issues: ["RESEND_API_KEY não configurada nos secrets"],
          lastError: "API key não encontrada",
          responseTime: Date.now() - startTime,
          requestId
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`✅ [HEALTH-${requestId}] API key encontrada, testando conectividade...`);

    // Test Resend connectivity com timeout estendido
    const resend = new Resend(apiKey);
    
    const connectivityTest = async () => {
      try {
        console.log(`🔍 [HEALTH-${requestId}] Chamando Resend API...`);
        const testResponse = await resend.domains.list();
        console.log(`✅ [HEALTH-${requestId}] Resend respondeu:`, {
          domainsCount: testResponse.data?.length || 0,
          hasData: !!testResponse.data
        });
        return {
          success: true,
          domains: testResponse.data || []
        };
      } catch (error: any) {
        console.error(`❌ [HEALTH-${requestId}] Erro Resend:`, {
          message: error.message,
          status: error.status,
          code: error.code
        });
        return {
          success: false,
          error: error.message
        };
      }
    };

    // Timeout de 30 segundos para o teste
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout na verificação de conectividade (30s)")), 30000)
    );

    console.log(`⏳ [HEALTH-${requestId}] Executando teste com timeout de 30s...`);
    const connectivityResult = await Promise.race([
      connectivityTest(),
      timeoutPromise
    ]) as any;

    const responseTime = Date.now() - startTime;
    console.log(`⏱️ [HEALTH-${requestId}] Tempo total: ${responseTime}ms`);
    
    if (connectivityResult.success) {
      console.log(`✅ [HEALTH-${requestId}] Sistema operacional!`);
      return new Response(
        JSON.stringify({
          healthy: true,
          apiKeyValid: true,
          connectivity: "connected",
          domainValid: connectivityResult.domains?.length > 0,
          issues: [],
          responseTime,
          timestamp: new Date().toISOString(),
          attempt: requestData.attempt || 1,
          requestId,
          domains: connectivityResult.domains?.length || 0
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      console.log(`⚠️ [HEALTH-${requestId}] Problemas detectados:`, connectivityResult.error);
      return new Response(
        JSON.stringify({
          healthy: false,
          apiKeyValid: true,
          connectivity: "error",
          domainValid: false,
          issues: [`Erro de conectividade: ${connectivityResult.error}`],
          lastError: connectivityResult.error,
          responseTime,
          timestamp: new Date().toISOString(),
          attempt: requestData.attempt || 1,
          requestId
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

  } catch (error: any) {
    console.error(`❌ [HEALTH-${requestId}] Erro crítico:`, {
      message: error.message,
      stack: error.stack?.substring(0, 500),
      type: error.constructor.name
    });
    
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
        attempt: requestData.attempt || 1,
        requestId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("🚀 [HEALTH-CHECK] Edge Function carregada e pronta!");
serve(handler);
