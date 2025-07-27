import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const discordWebhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
    
    console.log('🎯 Iniciando teste do Discord webhook...');
    
    if (!discordWebhookUrl) {
      console.error('❌ Discord webhook URL não encontrado');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'DISCORD_WEBHOOK_URL não configurado',
          help: 'Configure a URL do webhook em Supabase Settings > Edge Functions'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Obter mensagem do body da requisição
    const { message } = await req.json();
    
    if (!message) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Mensagem não fornecida'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📤 Enviando mensagem para Discord...');
    console.log('URL:', discordWebhookUrl);
    console.log('Mensagem:', JSON.stringify(message, null, 2));

    // Enviar mensagem para o Discord
    const discordResponse = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    console.log('📤 Status da resposta Discord:', discordResponse.status);

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error('❌ Erro na resposta Discord:', errorText);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Erro ao enviar para Discord',
          status_code: discordResponse.status,
          details: errorText,
          help: 'Verifique se a URL do webhook está correta e ativa'
        }),
        { 
          status: discordResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Mensagem enviada com sucesso para Discord!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Mensagem enviada com sucesso para Discord!',
        timestamp: new Date().toISOString(),
        webhook_response_status: discordResponse.status
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ Erro geral:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message,
        help: 'Verifique os logs para mais detalhes'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});