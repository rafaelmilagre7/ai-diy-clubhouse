import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendWhatsAppRequest {
  inviteId: string;
  phone: string;
  inviteUrl: string;
  recipientName: string;
  invitedByName: string;
  roleName: string;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('📱 [SEND-WHATSAPP] Iniciando processamento...');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const whatsappApiKey = Deno.env.get('WHATSAPP_API_KEY');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_ID');
    
    if (!whatsappApiKey || !phoneNumberId) {
      console.log('⚠️ [SEND-WHATSAPP] Credenciais WhatsApp não configuradas, simulando envio...');
      
      // Simular envio bem-sucedido quando não há credenciais
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const body: SendWhatsAppRequest = await req.json();
      
      // Registrar delivery simulado
      await supabase
        .from('invite_deliveries')
        .insert({
          invite_id: body.inviteId,
          channel: 'whatsapp',
          status: 'simulated',
          sent_at: new Date().toISOString(),
          metadata: {
            phone: body.phone,
            simulated: true,
            reason: 'WhatsApp credentials not configured'
          }
        });

      return new Response(
        JSON.stringify({
          success: true,
          simulated: true,
          message: 'WhatsApp credentials not configured - delivery simulated',
          sentAt: new Date().toISOString()
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: SendWhatsAppRequest = await req.json();
    console.log('📱 [SEND-WHATSAPP] Dados recebidos:', {
      phone: body.phone,
      recipientName: body.recipientName,
      invitedBy: body.invitedByName
    });

    // URL do convite já vem pronta dos dados recebidos
    console.log('🔗 [WHATSAPP] URL do convite recebida:', body.inviteUrl)
    
    // Limpar número de telefone (remover caracteres especiais)
    const cleanPhone = body.phone.replace(/\D/g, '');
    
    // Construir mensagem WhatsApp
    const message = `🚀 *Viver de IA - Convite Especial*

Olá! *${body.invitedByName}* convidou você para acessar nossa plataforma de IA.

📧 *Email:* ${body.recipientName}
👤 *Nível de acesso:* ${body.roleName}

${body.notes ? `💬 *Mensagem:* ${body.notes}\n\n` : ''}🎯 *Clique aqui para aceitar seu convite:*
${body.inviteUrl}

⚠️ Este convite tem validade limitada. Complete seu cadastro o quanto antes!

---
_Mensagem automática - Viver de IA_`;

    console.log('📝 [SEND-WHATSAPP] Mensagem preparada para:', cleanPhone);

    // Enviar via WhatsApp Business API
    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: {
            body: message
          }
        })
      }
    );

    const whatsappResult = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      console.error('❌ [SEND-WHATSAPP] Erro da API:', whatsappResult);
      throw new Error(`WhatsApp API error: ${whatsappResult.error?.message || 'Unknown error'}`);
    }

    console.log('✅ [SEND-WHATSAPP] Mensagem enviada:', whatsappResult.messages?.[0]?.id);

    // Registrar delivery no banco
    const { error: deliveryError } = await supabase
      .from('invite_deliveries')
      .insert({
        invite_id: body.inviteId,
        channel: 'whatsapp',
        status: 'sent',
        provider_id: whatsappResult.messages?.[0]?.id,
        sent_at: new Date().toISOString(),
        metadata: {
          whatsapp_id: whatsappResult.messages?.[0]?.id,
          phone: cleanPhone,
          original_phone: body.phone,
        }
      });

    if (deliveryError) {
      console.warn('⚠️ [SEND-WHATSAPP] Erro ao registrar delivery:', deliveryError);
    }

    // Atualizar estatísticas do convite
    await supabase
      .from('invites')
      .update({
        send_attempts: 1,
        last_sent_at: new Date().toISOString()
      })
      .eq('id', body.inviteId);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: whatsappResult.messages?.[0]?.id,
        sentAt: new Date().toISOString(),
        recipient: cleanPhone
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ [SEND-WHATSAPP] Erro geral:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Falha no envio do WhatsApp'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);