// ⚡ EDGE FUNCTION: Limpeza Automática de Convites Deletados
// Executa limpeza física de convites marcados como deletados há mais de 24h

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CleanupResult {
  success: boolean;
  cleaned_count?: number;
  duration_ms?: number;
  message?: string;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = performance.now();

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🧹 Iniciando limpeza automática de convites deletados...');

    // Execute cleanup using database function
    const { data, error } = await supabase.rpc('cleanup_deleted_invites_background');

    if (error) {
      console.error('❌ Erro na limpeza:', error);
      throw error;
    }

    const totalTime = Math.round(performance.now() - startTime);
    const result: CleanupResult = {
      success: true,
      cleaned_count: data.cleaned_count || 0,
      duration_ms: totalTime,
      message: data.message || 'Limpeza concluída'
    };

    console.log(`✅ Limpeza concluída: ${data.cleaned_count} convites removidos em ${totalTime}ms`);

    // Log performance metrics for monitoring
    await supabase.from('audit_logs').insert({
      event_type: 'system_maintenance',
      action: 'invite_cleanup_completed',
      details: {
        cleaned_invites: data.cleaned_count,
        execution_time_ms: totalTime,
        automated: true,
        success: true
      },
      severity: 'info'
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    const totalTime = Math.round(performance.now() - startTime);
    console.error('❌ Erro crítico na limpeza de convites:', error);

    const result: CleanupResult = {
      success: false,
      error: error.message,
      duration_ms: totalTime,
      message: 'Falha na limpeza automática'
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});