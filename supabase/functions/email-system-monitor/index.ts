
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

interface MonitoringMetrics {
  timestamp: string;
  health: {
    overall: 'healthy' | 'degraded' | 'critical';
    resend_status: 'connected' | 'degraded' | 'down';
    queue_status: 'normal' | 'backed_up' | 'critical';
    functions_status: 'operational' | 'degraded' | 'down';
  };
  performance: {
    avg_response_time: number;
    success_rate: number;
    queue_length: number;
    processing_rate: number;
  };
  errors: {
    recent_errors: number;
    error_rate: number;
    critical_issues: string[];
  };
  statistics: {
    emails_sent_today: number;
    emails_queued: number;
    emails_failed: number;
    invites_pending: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`📊 [MONITOR-${requestId}] Iniciando monitoramento do sistema...`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const apiKey = Deno.env.get("RESEND_API_KEY");
    
    // Inicializar métricas
    const metrics: MonitoringMetrics = {
      timestamp: new Date().toISOString(),
      health: {
        overall: 'healthy',
        resend_status: 'connected',
        queue_status: 'normal',
        functions_status: 'operational'
      },
      performance: {
        avg_response_time: 0,
        success_rate: 100,
        queue_length: 0,
        processing_rate: 0
      },
      errors: {
        recent_errors: 0,
        error_rate: 0,
        critical_issues: []
      },
      statistics: {
        emails_sent_today: 0,
        emails_queued: 0,
        emails_failed: 0,
        invites_pending: 0
      }
    };

    // 1. Testar conectividade Resend
    console.log(`🔍 [MONITOR-${requestId}] Testando Resend...`);
    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        const resendStart = Date.now();
        const domainsResponse = await resend.domains.list();
        const resendTime = Date.now() - resendStart;
        
        metrics.performance.avg_response_time = resendTime;
        
        if (resendTime > 5000) {
          metrics.health.resend_status = 'degraded';
          metrics.errors.critical_issues.push('Resend com alta latência');
        }
        
        if (!domainsResponse.data || domainsResponse.data.length === 0) {
          metrics.health.resend_status = 'degraded';
          metrics.errors.critical_issues.push('Nenhum domínio configurado no Resend');
        }
        
        console.log(`✅ [MONITOR-${requestId}] Resend OK - ${resendTime}ms`);
      } catch (resendError: any) {
        metrics.health.resend_status = 'down';
        metrics.errors.critical_issues.push(`Resend indisponível: ${resendError.message}`);
        console.error(`❌ [MONITOR-${requestId}] Resend falhou:`, resendError);
      }
    } else {
      metrics.health.resend_status = 'down';
      metrics.errors.critical_issues.push('RESEND_API_KEY não configurada');
    }

    // 2. Monitorar fila de emails
    console.log(`📬 [MONITOR-${requestId}] Verificando fila de emails...`);
    try {
      // Emails na fila
      const { count: queuedCount, error: queueError } = await supabase
        .from('email_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (!queueError && queuedCount !== null) {
        metrics.statistics.emails_queued = queuedCount;
        metrics.performance.queue_length = queuedCount;
        
        if (queuedCount > 100) {
          metrics.health.queue_status = 'critical';
          metrics.errors.critical_issues.push(`Fila crítica: ${queuedCount} emails pendentes`);
        } else if (queuedCount > 50) {
          metrics.health.queue_status = 'backed_up';
        }
      }

      // Emails enviados hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: sentToday } = await supabase
        .from('email_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'sent')
        .gte('sent_at', today.toISOString());

      if (sentToday !== null) {
        metrics.statistics.emails_sent_today = sentToday;
      }

      // Emails falhados
      const { count: failedCount } = await supabase
        .from('email_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'failed');

      if (failedCount !== null) {
        metrics.statistics.emails_failed = failedCount;
      }

      console.log(`📊 [MONITOR-${requestId}] Fila: ${queuedCount} pendentes, ${sentToday} enviados hoje`);
    } catch (queueError: any) {
      metrics.health.queue_status = 'critical';
      metrics.errors.critical_issues.push(`Erro na fila: ${queueError.message}`);
      console.error(`❌ [MONITOR-${requestId}] Erro na fila:`, queueError);
    }

    // 3. Verificar convites pendentes
    console.log(`📨 [MONITOR-${requestId}] Verificando convites...`);
    try {
      const { count: pendingInvites } = await supabase
        .from('invites')
        .select('id', { count: 'exact', head: true })
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString());

      if (pendingInvites !== null) {
        metrics.statistics.invites_pending = pendingInvites;
      }
    } catch (inviteError: any) {
      metrics.errors.critical_issues.push(`Erro nos convites: ${inviteError.message}`);
    }

    // 4. Calcular taxa de sucesso
    if (metrics.statistics.emails_sent_today > 0) {
      const totalEmails = metrics.statistics.emails_sent_today + metrics.statistics.emails_failed;
      metrics.performance.success_rate = Math.round((metrics.statistics.emails_sent_today / totalEmails) * 100);
      
      if (metrics.performance.success_rate < 90) {
        metrics.health.overall = 'degraded';
        metrics.errors.critical_issues.push(`Taxa de sucesso baixa: ${metrics.performance.success_rate}%`);
      }
    }

    // 5. Calcular taxa de erro
    if (metrics.statistics.emails_failed > 0) {
      const totalEmails = metrics.statistics.emails_sent_today + metrics.statistics.emails_failed;
      metrics.errors.error_rate = Math.round((metrics.statistics.emails_failed / totalEmails) * 100);
    }

    // 6. Determinar saúde geral
    const criticalIssues = metrics.errors.critical_issues.length;
    if (criticalIssues > 2 || metrics.health.resend_status === 'down') {
      metrics.health.overall = 'critical';
    } else if (criticalIssues > 0 || metrics.health.queue_status === 'backed_up') {
      metrics.health.overall = 'degraded';
    }

    const responseTime = Date.now() - startTime;
    console.log(`🏁 [MONITOR-${requestId}] Monitoramento concluído - Status: ${metrics.health.overall}`);

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
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        health: {
          overall: 'critical',
          resend_status: 'unknown',
          queue_status: 'unknown',
          functions_status: 'down'
        },
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

console.log("📊 [SYSTEM-MONITOR] Monitoramento avançado carregado!");
serve(handler);
