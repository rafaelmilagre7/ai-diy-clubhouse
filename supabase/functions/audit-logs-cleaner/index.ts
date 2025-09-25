import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabaseServiceClient, cleanupConnections } from '../_shared/supabase-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CleanupStats {
  deleted_count: number;
  retention_days: number;
  execution_time_ms: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const supabase = getSupabaseServiceClient();
    
    // Parâmetros de limpeza (30 dias por padrão)
    const retentionDays = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`[AUDIT_CLEANUP] Iniciando limpeza de logs anteriores a: ${cutoffDate.toISOString()}`);

    // Contar registros antes da limpeza
    const { count: totalBefore } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true });

    // Deletar logs antigos em lotes para evitar timeouts
    const batchSize = 1000;
    let totalDeleted = 0;
    let hasMore = true;

    while (hasMore) {
      const { data: logsToDelete, error: selectError } = await supabase
        .from('audit_logs')
        .select('id')
        .lt('timestamp', cutoffDate.toISOString())
        .order('timestamp', { ascending: true })
        .limit(batchSize);

      if (selectError) {
        throw new Error(`Erro ao selecionar logs: ${selectError.message}`);
      }

      if (!logsToDelete || logsToDelete.length === 0) {
        hasMore = false;
        break;
      }

      const idsToDelete = logsToDelete.map(log => log.id);
      
      const { error: deleteError } = await supabase
        .from('audit_logs')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        console.error(`[AUDIT_CLEANUP] Erro ao deletar lote:`, deleteError);
        break;
      }

      totalDeleted += logsToDelete.length;
      console.log(`[AUDIT_CLEANUP] Deletados ${logsToDelete.length} registros (total: ${totalDeleted})`);

      // Pequena pausa entre lotes
      if (logsToDelete.length === batchSize) {
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        hasMore = false;
      }
    }

    const executionTime = Date.now() - startTime;

    // Log da operação de limpeza
    await supabase
      .from('audit_logs')
      .insert({
        event_type: 'system_maintenance',
        action: 'audit_logs_cleanup',
        details: {
          deleted_count: totalDeleted,
          retention_days: retentionDays,
          execution_time_ms: executionTime,
          cutoff_date: cutoffDate.toISOString(),
          total_before: totalBefore
        },
        severity: 'info'
      });

    const stats: CleanupStats = {
      deleted_count: totalDeleted,
      retention_days: retentionDays,
      execution_time_ms: executionTime
    };

    console.log(`[AUDIT_CLEANUP] Concluído: ${totalDeleted} registros removidos em ${executionTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Limpeza de audit logs concluída com sucesso`,
        stats
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('[AUDIT_CLEANUP] Erro na limpeza:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
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