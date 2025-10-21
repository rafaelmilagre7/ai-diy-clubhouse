import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🚀 Executando teste de integração...');

    // Invocar a função de teste
    const { data, error } = await supabase.functions.invoke('test-resend-integration', {
      body: {}
    });

    if (error) {
      console.error('❌ Erro ao executar teste:', error);
      throw error;
    }

    console.log('✅ Teste concluído:', data);

    return new Response(
      JSON.stringify(data, null, 2),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Erro:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Falha ao executar teste de integração'
      }, null, 2),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
