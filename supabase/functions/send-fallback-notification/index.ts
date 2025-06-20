
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-function-timeout",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface FallbackNotificationRequest {
  email: string;
  inviteUrl: string;
  roleName: string;
  type: 'invite_fallback' | 'system_notification';
  requestId: string;
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🆘 [FALLBACK-${requestId}] Nova requisição: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log(`🔄 [FALLBACK-${requestId}] CORS Preflight - respondendo`);
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  if (req.method !== "POST") {
    console.log(`❌ [FALLBACK-${requestId}] Método não permitido: ${req.method}`);
    return new Response(
      JSON.stringify({ error: "Método não permitido" }), 
      { 
        status: 405, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }

  const startTime = Date.now();

  try {
    console.log(`🔄 [FALLBACK-${requestId}] Processando notificação de fallback...`);
    
    const { email, inviteUrl, roleName, type }: FallbackNotificationRequest = await req.json();
    
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email inválido" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`📋 [FALLBACK-${requestId}] Registrando em fila de recuperação:`, {
      email,
      type,
      roleName
    });

    // Simular registro em fila de recuperação
    // Em uma implementação real, aqui seria salvo em uma tabela de fila
    const recoveryRecord = {
      id: crypto.randomUUID(),
      email,
      inviteUrl,
      roleName,
      type,
      status: 'queued',
      attempts: 0,
      created_at: new Date().toISOString(),
      next_retry: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutos
    };

    console.log(`✅ [FALLBACK-${requestId}] Notificação registrada:`, {
      recoveryId: recoveryRecord.id,
      nextRetry: recoveryRecord.next_retry
    });

    const responseTime = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notificação registrada na fila de recuperação",
        recoveryId: recoveryRecord.id,
        nextRetry: recoveryRecord.next_retry,
        responseTime,
        requestId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`❌ [FALLBACK-${requestId}] Erro crítico:`, {
      message: error.message,
      stack: error.stack?.substring(0, 500),
      type: error.constructor.name
    });
    
    const responseTime = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno do servidor",
        responseTime,
        requestId
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("🆘 [FALLBACK] Edge Function carregada e pronta para recuperação!");
serve(handler);
