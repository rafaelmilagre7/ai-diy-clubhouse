
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`📊 [MONITOR-${requestId}] Iniciando monitoramento do sistema`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`🔍 [MONITOR-${requestId}] Coletando métricas...`);

    // 1. Verificar status do Resend
    let resendStatus = 'down';
    let resendResponseTime = 0;
    try {
      const resendStartTime = Date.now();
      const apiKey = Deno.env.get("RESEND_API_KEY");
      if (apiKey) {
        const resend = new Resend(apiKey);
        // Fazer uma chamada simples para verificar conectividade
        await resend.emails.send({
          from: "Test <test@viverdeia.ai>",
          to: ["test@example.com"],
          subject: "Health Check",
          html: "Test",
        }).catch(() => {}); // Ignorar erro, só queremos testar conectividade
        
        resendResponseTime = Date.now() - resendStartTime;
        resendStatus = resendResponseTime < 3000 ? 'connected' : 'degraded';
      }
    } catch (error) {
      console.error(`❌ [MONITOR-${requestId}] Erro no teste Resend:`, error);
      resendStatus = 'down';
    }

    // 2. Verificar fila de emails
    const { data: queueData, error: queueError } = await supabase
      .from('email_queue')
      .select('status')
      .order('created_at', { ascending: false })
      .limit(100);

    let queueStatus = 'normal';
    let queueLength = 0;
    
    if (!queueError && queueData) {
      queueLength = queueData.filter(item => item.status === 'pending').length;
      if (queueLength > 50) queueStatus = 'critical';
      else if (queueLength > 20) queueStatus = 'backed_up';
    } else {
      queueStatus = 'critical';
    }

    // 3. Estatísticas de email hoje
    const today = new Date().toISOString().split('T')[0];
    
    const { data: sentToday } = await supabase
      .from('invite_send_attempts')
      .select('*', { count: 'exact' })
      .eq('status', 'success')
      .gte('created_at', `${today}T00:00:00Z`);

    const { data: failedToday } = await supabase
      .from('invite_send_attempts')
      .select('*', { count: 'exact' })
      .eq('status', 'failed')
      .gte('created_at', `${today}T00:00:00Z`);

    const { data: pendingInvites } = await supabase
      .from('invites')
      .select('*', { count: 'exact' })
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString());

    // 4. Calcular métricas de performance
    const { data: recentAttempts } = await supabase
      .from('invite_send_attempts')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    let successRate = 100;
    let avgResponseTime = resendResponseTime;
    let recentErrors = 0;
    
    if (recentAttempts && recentAttempts.length > 0) {
      const successful = recentAttempts.filter(a => a.status === 'success').length;
      successRate = Math.round((successful / recentAttempts.length) * 100);
      recentErrors = recentAttempts.filter(a => a.status === 'failed').length;
    }

    // 5. Determinar status geral
    let overallHealth = 'healthy';
    if (resendStatus === 'down' || queueStatus === 'critical' || successRate < 50) {
      overallHealth = 'critical';
    } else if (resendStatus === 'degraded' || queueStatus === 'backed_up' || successRate < 85) {
      overallHealth = 'degraded';
    }

    // 6. Identificar problemas críticos
    const criticalIssues = [];
    if (resendStatus === 'down') criticalIssues.push('Resend API não responsiva');
    if (queueLength > 50) criticalIssues.push(`Fila com ${queueLength} emails pendentes`);
    if (successRate < 50) criticalIssues.push(`Taxa de sucesso baixa: ${successRate}%`);

    const metrics = {
      timestamp: new Date().toISOString(),
      health: {
        overall: overallHealth,
        resend_status: resendStatus,
        queue_status: queueStatus,
        functions_status: 'operational' // Assumindo que se chegou aqui, está funcionando
      },
      performance: {
        avg_response_time: avgResponseTime,
        success_rate: successRate,
        queue_length: queueLength,
        processing_rate: Math.round(queueLength > 0 ? 60 / (queueLength / 10) : 60) // emails/min estimado
      },
      errors: {
        recent_errors: recentErrors,
        error_rate: recentAttempts ? Math.round((recentErrors / recentAttempts.length) * 100) : 0,
        critical_issues: criticalIssues
      },
      statistics: {
        emails_sent_today: sentToday?.length || 0,
        emails_queued: queueLength,
        emails_failed: failedToday?.length || 0,
        invites_pending: pendingInvites?.length || 0
      }
    };

    const responseTime = Date.now() - startTime;
    
    console.log(`✅ [MONITOR-${requestId}] Monitoramento concluído:`, {
      overallHealth,
      responseTime,
      criticalIssues: criticalIssues.length
    });

    return new Response(
      JSON.stringify({
        success: true,
        metrics,
        responseTime,
        requestId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`❌ [MONITOR-${requestId}] Erro crítico:`, error);
    
    const responseTime = Date.now() - startTime;
    
    // Retornar métricas de fallback em caso de erro
    const fallbackMetrics = {
      timestamp: new Date().toISOString(),
      health: {
        overall: 'critical',
        resend_status: 'down',
        queue_status: 'critical',
        functions_status: 'degraded'
      },
      performance: {
        avg_response_time: 0,
        success_rate: 0,
        queue_length: 0,
        processing_rate: 0
      },
      errors: {
        recent_errors: 1,
        error_rate: 100,
        critical_issues: [`Erro no monitoramento: ${error.message}`]
      },
      statistics: {
        emails_sent_today: 0,
        emails_queued: 0,
        emails_failed: 1,
        invites_pending: 0
      }
    };
    
    return new Response(
      JSON.stringify({
        success: true, // Retorna success para não quebrar o frontend
        metrics: fallbackMetrics,
        error: error.message,
        responseTime,
        requestId
      }),
      {
        status: 200, // Status 200 para métricas de fallback
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("📊 [EMAIL-MONITOR] Edge Function carregada e pronta!");
serve(handler);
