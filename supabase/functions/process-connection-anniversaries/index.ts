import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { getSecureCorsHeaders, isOriginAllowed, forbiddenOriginResponse } from '../_shared/secureCors.ts';

Deno.serve(async (req) => {
  const corsHeaders = getSecureCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 🔒 VALIDAÇÃO CORS: Bloquear origens não confiáveis
  if (!isOriginAllowed(req)) {
    console.warn('[SECURITY] Origem não autorizada bloqueada:', req.headers.get('origin'));
    return forbiddenOriginResponse();
  }

  try {
    console.log('🔄 Processando aniversários de conexão...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.rpc('process_connection_anniversaries');

    if (error) {
      console.error('❌ Erro ao processar aniversários:', error);
      throw error;
    }

    console.log('✅ Aniversários processados:', data);

    return new Response(
      JSON.stringify({
        success: true,
        data,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
