
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
    console.log('🔧 [CONFIG] Processando solicitação de credenciais...');
    console.log('🔧 [CONFIG] Método:', req.method);
    console.log('🔧 [CONFIG] URL:', req.url);

    // CORREÇÃO: Buscar credenciais dos Supabase Secrets
    const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('VITE_SUPABASE_ANON_KEY');

    console.log('🔍 [CONFIG] URL encontrada:', !!supabaseUrl);
    console.log('🔍 [CONFIG] Key encontrada:', !!supabaseAnonKey);
    
    // CORREÇÃO: Se não encontrar nos secrets, usar valores padrão
    const finalUrl = supabaseUrl || 'https://bkbfvwcnwdqchrwwdqfa.supabase.co';
    const finalKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYmZ2d2Nud2RxY2hyd3dkcWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzMzA5ODYsImV4cCI6MjA0NjkwNjk4Nn0.6v_PiF2PmhEcjfJ5Zs7qD_Yp0IXEQ7b3rXvpFCLGpnI';

    // Validar formato das credenciais
    if (!finalUrl.startsWith('https://')) {
      console.error('❌ [CONFIG] URL inválida:', finalUrl.substring(0, 20) + '...');
      
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

    if (!finalKey.startsWith('eyJ')) {
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

    console.log('✅ [CONFIG] Credenciais válidas preparadas');

    const response: ConfigResponse = {
      url: finalUrl,
      anonKey: finalKey,
      success: true
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ [CONFIG] Erro ao processar credenciais:', error);
    
    const response: ConfigResponse = {
      url: '',
      anonKey: '',
      success: false,
      error: 'Erro interno ao processar credenciais'
    };

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
