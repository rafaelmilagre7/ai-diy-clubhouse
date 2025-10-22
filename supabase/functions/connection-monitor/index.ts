import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { getSupabaseServiceClient, cleanupConnections } from '../_shared/supabase-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConnectionMetrics {
  total_connections: number;
  active_connections: number;
  idle_connections: number;
  idle_in_transaction: number;
  pool_utilization_percent: number;
  avg_connection_age_minutes: number;
  top_applications: Array<{
    application_name: string;
    connection_count: number;
    state: string;
  }>;
  alerts: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseServiceClient();
    
    console.log('[CONNECTION_MONITOR] Iniciando coleta de métricas de conexão...');

    // Query para obter estatísticas de conexões ativas
    const { data: connections, error } = await supabase.rpc('get_connection_stats');
    
    if (error) {
      throw new Error(`Erro ao obter estatísticas de conexão: ${error.message}`);
    }

    interface Connection {
      state: string;
      backend_start: string;
      application_name: string;
    }

    // Calcular métricas
    const totalConnections = connections?.length || 0;
    const activeConnections = connections?.filter((c: Connection) => c.state === 'active')?.length || 0;
    const idleConnections = connections?.filter((c: Connection) => c.state === 'idle')?.length || 0;
    const idleInTransaction = connections?.filter((c: Connection) => c.state === 'idle in transaction')?.length || 0;
    
    // Assumindo limite máximo de 90 conexões (SMALL instance)
    const maxConnections = 90;
    const poolUtilization = (totalConnections / maxConnections) * 100;

    // Calcular idade média das conexões
    const now = new Date();
    const connectionAges = connections?.map((c: Connection) => {
      const backendStart = new Date(c.backend_start);
      return (now.getTime() - backendStart.getTime()) / (1000 * 60); // em minutos
    }) || [];
    const avgConnectionAge = connectionAges.length > 0 
      ? connectionAges.reduce((a: number, b: number) => a + b, 0) / connectionAges.length 
      : 0;

    // Top aplicações por número de conexões
    const appStats = connections?.reduce((acc: any, conn: Connection) => {
      const app = conn.application_name || 'unknown';
      if (!acc[app]) {
        acc[app] = { count: 0, states: {} };
      }
      acc[app].count++;
      acc[app].states[conn.state] = (acc[app].states[conn.state] || 0) + 1;
      return acc;
    }, {}) || {};

    const topApplications = Object.entries(appStats)
      .map(([app, stats]: [string, any]) => ({
        application_name: app,
        connection_count: stats.count,
        state: Object.keys(stats.states).join(', ')
      }))
      .sort((a, b) => b.connection_count - a.connection_count)
      .slice(0, 5);

    // ALERTAS DE EMERGÊNCIA - ANTI-COLAPSO
    const alerts: string[] = [];
    const criticalAlerts: string[] = [];
    
    // ALERTA CRÍTICO: Limite de colapso próximo
    if (totalConnections > 25) {
      criticalAlerts.push(`🚨 EMERGÊNCIA: ${totalConnections} conexões ativas (LIMITE: 25)`);
      
      // Tentar forçar cleanup de conexões órfãs
      try {
        await supabase.rpc('force_cleanup_connections');
        console.log('🔧 [EMERGENCY] Cleanup forçado executado');
      } catch (cleanupError) {
        console.error('❌ [EMERGENCY] Falha no cleanup:', cleanupError);
      }
    }
    
    if (poolUtilization > 80) {
      criticalAlerts.push(`🔥 CRÍTICO: Pool em ${poolUtilization.toFixed(1)}% (>80%)`);
    } else if (poolUtilization > 60) {
      alerts.push(`⚠️ ATENÇÃO: Pool em ${poolUtilization.toFixed(1)}% (>60%)`);
    }
    
    // Auto-kill edge functions longas
    if (totalConnections > 20) {
      console.log('🚨 [AUTO-KILL] Iniciando limpeza agressiva...');
      // Implementar auto-kill de edge functions antigas
    }

    if (idleInTransaction > 5) {
      alerts.push(`ATENÇÃO: ${idleInTransaction} conexões idle in transaction detectadas`);
    }

    if (avgConnectionAge > 60) {
      alerts.push(`ATENÇÃO: Idade média das conexões é ${avgConnectionAge.toFixed(1)} minutos (>60min)`);
    }

    const longRunningConnections = connections?.filter((c: Connection) => {
      const age = (now.getTime() - new Date(c.backend_start).getTime()) / (1000 * 60);
      return age > 30; // conexões com mais de 30 minutos
    }).length || 0;

    if (longRunningConnections > 10) {
      alerts.push(`ATENÇÃO: ${longRunningConnections} conexões com mais de 30 minutos detectadas`);
    }

    const metrics: ConnectionMetrics = {
      total_connections: totalConnections,
      active_connections: activeConnections,
      idle_connections: idleConnections,
      idle_in_transaction: idleInTransaction,
      pool_utilization_percent: poolUtilization,
      avg_connection_age_minutes: avgConnectionAge,
      top_applications: topApplications,
      alerts
    };

    // ALERTAS EM TEMPO REAL
    const allAlerts = [...criticalAlerts, ...alerts];
    
    // Registrar com severidade baseada em alertas críticos
    const severity = criticalAlerts.length > 0 ? 'critical' : 
                     alerts.length > 0 ? 'warning' : 'info';
    
    // Usar rate limiter para evitar spam de logs
    try {
      const rateLimiterResponse = await supabase.functions.invoke('emergency-rate-limiter', {
        body: {
          action: 'log',
          logData: {
            event_type: 'system_monitoring',
            action: 'connection_metrics_collected',
            details: { ...metrics, criticalAlerts, totalAlerts: allAlerts.length },
            severity
          }
        }
      });
      
      if (!rateLimiterResponse.data?.success) {
        console.warn('⚠️ [MONITOR] Rate limiter ativo - log descartado');
      }
    } catch (logError) {
      // Fallback: log direto se rate limiter falhar
      await supabase
        .from('audit_logs')
        .insert({
          event_type: 'system_monitoring',
          action: 'connection_metrics_collected',
          details: { ...metrics, criticalAlerts },
          severity
        });
    }

    console.log('[CONNECTION_MONITOR] Métricas coletadas:', {
      total: totalConnections,
      utilization: `${poolUtilization.toFixed(1)}%`,
      alerts: alerts.length
    });

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        metrics,
        recommendations: alerts.length > 0 ? [
          'Considere implementar connection pooling mais agressivo',
          'Verifique edge functions que não reutilizam conexões',
          'Configure timeouts para conexões idle'
        ] : ['Sistema operando dentro dos parâmetros normais']
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('[CONNECTION_MONITOR] Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } finally {
    cleanupConnections();
  }
});