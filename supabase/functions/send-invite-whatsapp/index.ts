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
    const whatsappApiKey = Deno.env.get('WHATSAPP_API_KEY') || Deno.env.get('WHATSAPP_BUSINESS_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_ID') || Deno.env.get('WHATSAPP_BUSINESS_PHONE_ID');
    
    console.log('🔑 [SEND-WHATSAPP] Credenciais detectadas:', { hasToken: !!whatsappApiKey, hasPhoneId: !!phoneNumberId });
    
    if (!whatsappApiKey || !phoneNumberId) {
      console.log('⚠️ [SEND-WHATSAPP] Credenciais ausentes (verifique nomes WHATSAPP_API_KEY/WHATSAPP_BUSINESS_TOKEN e WHATSAPP_PHONE_ID/WHATSAPP_BUSINESS_PHONE_ID). Simulando envio...');
      
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
    
    // Normalização do telefone para formato E.164 (Brasil)
    const rawPhone = body.phone || '';
    const onlyDigits = rawPhone.replace(/\D/g, '').replace(/^0+/, '');
    let e164 = onlyDigits;
    if (!e164.startsWith('55')) {
      if (e164.length === 11) {
        e164 = `55${e164}`; // DDD + 9 + número
      } else if (e164.length === 10) {
        // Sem o 9: insere automaticamente
        e164 = `55${e164.slice(0,2)}9${e164.slice(2)}`;
      } else {
        e164 = `55${e164}`;
      }
    } else {
      const after = e164.slice(2);
      if (after.length === 10) {
        e164 = `55${after.slice(0,2)}9${after.slice(2)}`;
      }
    }

    console.log('🧹 [SEND-WHATSAPP] Telefone normalizado:', { original: body.phone, e164 });

    // 1) Verificar se o número é WhatsApp válido via Contacts API
    const contactsRes = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messaging_product: 'whatsapp', contacts: [{ input: e164 }] }),
    });

    const contactsJson = await contactsRes.json();
    const contact = contactsJson?.contacts?.[0];
    const isValid = contact?.status === 'valid';
    const waId: string | undefined = contact?.wa_id;

    if (!isValid) {
      console.error('❌ [SEND-WHATSAPP] Número inválido para WhatsApp:', contactsJson);
      const { error: deliveryErr } = await supabase
        .from('invite_deliveries')
        .insert({
          invite_id: body.inviteId,
          channel: 'whatsapp',
          status: 'failed',
          error_message: `Número inválido para WhatsApp (${e164})`,
          metadata: { phone: e164, original_phone: body.phone, contacts_response: contactsJson },
        });
      if (deliveryErr) console.warn('⚠️ [SEND-WHATSAPP] Erro ao registrar delivery inválido:', deliveryErr);
      return new Response(
        JSON.stringify({ success: false, error: 'Número não é WhatsApp válido', details: contactsJson }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2) Construir payload (usa template se configurado)
    const templateName = Deno.env.get('WHATSAPP_TEMPLATE_NAME');

    // Mensagem de texto original (fallback)
    const message = `🚀 *Viver de IA - Convite Especial*\n\nOlá! *${body.invitedByName}* convidou você para acessar nossa plataforma de IA.\n\n📧 *Email:* ${body.recipientName}\n👤 *Nível de acesso:* ${body.roleName}\n\n${body.notes ? `💬 *Mensagem:* ${body.notes}\n\n` : ''}🎯 *Clique aqui para aceitar seu convite:*\n${body.inviteUrl}\n\n⚠️ Este convite tem validade limitada. Complete seu cadastro o quanto antes!\n\n---\n_Mensagem automática - Viver de IA_`;

    const toRecipient = waId || e164; // Usa wa_id quando disponível

    const payload = templateName
      ? {
          messaging_product: 'whatsapp',
          to: toRecipient,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'pt_BR' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: body.recipientName || 'tudo bem' },
                  { type: 'text', text: body.inviteUrl },
                  { type: 'text', text: body.invitedByName || 'Equipe' },
                ]
              }
            ]
          }
        }
      : {
          messaging_product: 'whatsapp',
          to: toRecipient,
          type: 'text',
          text: { body: message, preview_url: true },
        };

    console.log('📝 [SEND-WHATSAPP] Mensagem preparada para:', toRecipient);

    // 3) Enviar via WhatsApp Business API
    const whatsappResponse = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const whatsappResult = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      console.error('❌ [SEND-WHATSAPP] Erro da API:', whatsappResult);
      const { error: deliveryErr } = await supabase
        .from('invite_deliveries')
        .insert({
          invite_id: body.inviteId,
          channel: 'whatsapp',
          status: 'failed',
          error_message: whatsappResult?.error?.message || 'Erro desconhecido',
          metadata: { phone: e164, original_phone: body.phone, wa_id: waId, payload_type: templateName ? 'template' : 'text' },
        });
      if (deliveryErr) console.warn('⚠️ [SEND-WHATSAPP] Erro ao registrar delivery failed:', deliveryErr);

      return new Response(
        JSON.stringify({ success: false, error: 'Falha ao enviar WhatsApp', details: whatsappResult }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const messageId: string | undefined = whatsappResult?.messages?.[0]?.id;
    console.log('✅ [SEND-WHATSAPP] Mensagem enviada:', messageId);

    // Registrar delivery no banco
    const { error: deliveryError } = await supabase
      .from('invite_deliveries')
      .insert({
        invite_id: body.inviteId,
        channel: 'whatsapp',
        status: 'sent',
        provider_id: messageId,
        sent_at: new Date().toISOString(),
        metadata: {
          whatsapp_id: messageId,
          phone: e164,
          original_phone: body.phone,
          wa_id: waId,
          payload_type: templateName ? 'template' : 'text',
        }
      });

    if (deliveryError) {
      console.warn('⚠️ [SEND-WHATSAPP] Erro ao registrar delivery:', deliveryError);
    }

    // Atualizar estatísticas do convite (incremento seguro)
    const { data: inviteRow } = await supabase
      .from('invites')
      .select('send_attempts')
      .eq('id', body.inviteId)
      .single();

    const attempts = (inviteRow?.send_attempts ?? 0) + 1;

    await supabase
      .from('invites')
      .update({ send_attempts: attempts, last_sent_at: new Date().toISOString() })
      .eq('id', body.inviteId);

    return new Response(
      JSON.stringify({ success: true, messageId, waId, recipient: e164, usedTemplate: !!templateName }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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