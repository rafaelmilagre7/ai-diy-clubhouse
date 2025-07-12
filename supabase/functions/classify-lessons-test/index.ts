import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🧪 TEST: classify-lessons-test function started');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    console.log('🔑 Checking OpenAI key:', {
      hasKey: !!openAIApiKey,
      keyLength: openAIApiKey?.length || 0
    });

    if (!openAIApiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'OpenAI API key not configured',
        configured: false
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Test OpenAI connection
    console.log('🤖 Testing OpenAI connection...');
    
    const testResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`
      }
    });

    console.log('📡 OpenAI response status:', testResponse.status);

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('❌ OpenAI error:', errorText);
      
      return new Response(JSON.stringify({
        success: false,
        error: `OpenAI API error: ${testResponse.status}`,
        configured: true,
        working: false,
        details: errorText
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const models = await testResponse.json();
    console.log('✅ OpenAI connection successful, models available:', models.data?.length || 0);

    return new Response(JSON.stringify({
      success: true,
      message: 'OpenAI configurado e funcionando!',
      configured: true,
      working: true,
      models_count: models.data?.length || 0,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in test function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      configured: !!Deno.env.get('OPENAI_API_KEY'),
      working: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});