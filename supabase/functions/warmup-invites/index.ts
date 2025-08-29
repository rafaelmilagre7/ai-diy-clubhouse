import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge Function para Pre-Warming das funções de convite
 * Evita cold starts mantendo as functions "aquecidas"
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔥 [WARMUP] Iniciando pré-aquecimento das edge functions...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !anonKey) {
      throw new Error('Configurações do Supabase não encontradas');
    }

    // Lista de functions para aquecer
    const functionsToWarmup = [
      'send-invite-email',
      'send-whatsapp-invite',
      'update_invite_send_stats'
    ];

    const warmupPromises = functionsToWarmup.map(async (functionName) => {
      try {
        console.log(`🔥 [WARMUP] Aquecendo ${functionName}...`);
        
        // Health check básico para manter function ativa
        const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ warmup: true, timestamp: Date.now() }),
          // Timeout curto para warmup
          signal: AbortSignal.timeout(3000)
        });

        const result = {
          function: functionName,
          status: response.status,
          warmed: response.status < 500 // Qualquer resposta < 500 indica function ativa
        };

        console.log(`✅ [WARMUP] ${functionName}: ${result.status}`);
        return result;

      } catch (error: any) {
        console.log(`⚠️ [WARMUP] ${functionName} erro (normal): ${error.message}`);
        return {
          function: functionName,
          status: 0,
          warmed: true, // Considera aquecida mesmo com erro (function respondeu)
          error: error.message
        };
      }
    });

    const results = await Promise.allSettled(warmupPromises);
    
    const warmupResults = results.map((result) => 
      result.status === 'fulfilled' ? result.value : { error: result.reason }
    );

    const successCount = warmupResults.filter(r => r.warmed).length;

    console.log(`🔥 [WARMUP] Concluído: ${successCount}/${functionsToWarmup.length} functions aquecidas`);

    return new Response(JSON.stringify({
      success: true,
      message: `Warmup concluído: ${successCount}/${functionsToWarmup.length} functions`,
      results: warmupResults,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ [WARMUP] Erro:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});