import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

    // Calcular métricas
    const totalConnections = connections?.length || 0;
    const activeConnections = connections?.filter(c => c.state === 'active')?.length || 0;
    const idleConnections = connections?.filter(c => c.state === 'idle')?.length || 0;
    const idleInTransaction = connections?.filter(c => c.state === 'idle in transaction')?.length || 0;
    
    // Assumindo limite máximo de 90 conexões (SMALL instance)
    const maxConnections = 90;
    const poolUtilization = (totalConnections / maxConnections) * 100;

    // Calcular idade média das conexões
    const now = new Date();
    const connectionAges = connections?.map(c => {
      const backendStart = new Date(c.backend_start);
      return (now.getTime() - backendStart.getTime()) / (1000 * 60); // em minutos
    }) || [];
    const avgConnectionAge = connectionAges.length > 0 
      ? connectionAges.reduce((a, b) => a + b, 0) / connectionAges.length 
      : 0;

    // Top aplicações por número de conexões
    const appStats = connections?.reduce((acc, conn) => {
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

    // Gerar alertas
    const alerts: string[] = [];
    
    if (poolUtilization > 80) {
      alerts.push(`CRÍTICO: Utilização do pool em ${poolUtilization.toFixed(1)}% (>80%)`);
    } else if (poolUtilization > 60) {
      alerts.push(`ATENÇÃO: Utilização do pool em ${poolUtilization.toFixed(1)}% (>60%)`);
    }

    if (idleInTransaction > 5) {
      alerts.push(`ATENÇÃO: ${idleInTransaction} conexões idle in transaction detectadas`);
    }

    if (avgConnectionAge > 60) {
      alerts.push(`ATENÇÃO: Idade média das conexões é ${avgConnectionAge.toFixed(1)} minutos (>60min)`);
    }

    const longRunningConnections = connections?.filter(c => {
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

    // Registrar métricas no audit_logs para histórico
    await supabase
      .from('audit_logs')
      .insert({
        event_type: 'system_monitoring',
        action: 'connection_metrics_collected',
        details: metrics,
        severity: alerts.length > 0 ? 'warning' : 'info'
      });

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
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
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