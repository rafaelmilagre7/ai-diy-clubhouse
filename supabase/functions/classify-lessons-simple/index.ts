import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 TESTE SIMPLES - Function started');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('📋 CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 Processing request...');
    const body = await req.json();
    console.log('📊 Request body:', JSON.stringify(body, null, 2));

    // Verificar variáveis de ambiente
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    console.log('🔑 Environment check:', {
      hasOpenAI: !!openAIApiKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      openAILength: openAIApiKey?.length || 0
    });

    if (!openAIApiKey) {
      console.error('❌ OpenAI API key missing');
      throw new Error('OpenAI API key not configured');
    }

    // Teste simples da OpenAI
    console.log('🧪 Testing OpenAI connection...');
    
    const testResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`
      }
    });

    console.log('📡 OpenAI response status:', testResponse.status);
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('❌ OpenAI error:', errorText);
      throw new Error(`OpenAI API error: ${testResponse.status}`);
    }

    console.log('✅ OpenAI connection successful');

    // Resposta de sucesso
    const result = {
      success: true,
      message: 'Teste simples executado com sucesso',
      timestamp: new Date().toISOString(),
      openai_status: 'working',
      test_data: body
    };

    console.log('✅ Success response:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : String(error);
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    console.error('❌ ERROR in simple test:', {
      message: errorMessage,
      stack: errorStack,
      name: errorName
    });

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});