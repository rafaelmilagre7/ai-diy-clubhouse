
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConfigResponse {
  url: string;
  anonKey: string;
  success: boolean;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 [CONFIG] Buscando credenciais dos Supabase Secrets...');

    // Buscar credenciais dos Supabase Secrets
    const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('VITE_SUPABASE_ANON_KEY');

    console.log('🔍 [CONFIG] URL encontrada:', !!supabaseUrl);
    console.log('🔍 [CONFIG] Key encontrada:', !!supabaseAnonKey);

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ [CONFIG] Credenciais não encontradas nos Supabase Secrets');
      
      const response: ConfigResponse = {
        url: '',
        anonKey: '',
        success: false,
        error: 'Credenciais não configuradas nos Supabase Secrets'
      };

      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validar formato das credenciais
    if (!supabaseUrl.startsWith('https://')) {
      console.error('❌ [CONFIG] URL inválida:', supabaseUrl.substring(0, 20) + '...');
      
      const response: ConfigResponse = {
        url: '',
        anonKey: '',
        success: false,
        error: 'URL do Supabase inválida'
      };

      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!supabaseAnonKey.startsWith('eyJ')) {
      console.error('❌ [CONFIG] Chave inválida');
      
      const response: ConfigResponse = {
        url: '',
        anonKey: '',
        success: false,
        error: 'Chave anônima do Supabase inválida'
      };

      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ [CONFIG] Credenciais válidas encontradas');

    const response: ConfigResponse = {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      success: true
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ [CONFIG] Erro ao buscar credenciais:', error);
    
    const response: ConfigResponse = {
      url: '',
      anonKey: '',
      success: false,
      error: 'Erro interno ao buscar credenciais'
    };

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
