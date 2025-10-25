import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[SESSION-CLEANUP] Iniciando limpeza de sessões expiradas');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Definir tempo de expiração: 7 dias de inatividade
    const expirationThreshold = new Date();
    expirationThreshold.setDate(expirationThreshold.getDate() - 7);

    // Buscar sessões expiradas
    const { data: expiredSessions, error: fetchError } = await supabase
      .from('user_sessions')
      .select('id, user_id, created_at, last_activity')
      .eq('is_active', true)
      .lt('last_activity', expirationThreshold.toISOString());

    if (fetchError) {
      console.error('[SESSION-CLEANUP] Erro ao buscar sessões:', fetchError);
      throw fetchError;
    }

    const sessionCount = expiredSessions?.length || 0;
    console.log(`[SESSION-CLEANUP] Encontradas ${sessionCount} sessões expiradas`);

    if (sessionCount === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Nenhuma sessão expirada encontrada',
          cleaned: 0,
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Marcar sessões como inativas
    const { error: updateError } = await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .lt('last_activity', expirationThreshold.toISOString())
      .eq('is_active', true);

    if (updateError) {
      console.error('[SESSION-CLEANUP] Erro ao atualizar sessões:', updateError);
      throw updateError;
    }

    // Registrar auditoria
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        event_type: 'session_cleanup',
        action: 'bulk_session_expiration',
        severity: 'low',
        details: {
          sessions_cleaned: sessionCount,
          threshold_date: expirationThreshold.toISOString(),
          timestamp: new Date().toISOString()
        }
      });

    if (auditError) {
      console.warn('[SESSION-CLEANUP] Aviso: Não foi possível registrar auditoria:', auditError);
      // Não falhar a operação por erro de auditoria
    }

    console.log(`[SESSION-CLEANUP] Limpeza concluída: ${sessionCount} sessões marcadas como inativas`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Limpeza de sessões concluída com sucesso',
        cleaned: sessionCount,
        threshold_date: expirationThreshold.toISOString(),
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[SESSION-CLEANUP] Erro inesperado:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erro ao executar limpeza de sessões',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
