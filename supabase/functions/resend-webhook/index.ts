import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { createHmac } from "https://deno.land/std@0.190.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
};

// Função para verificar assinatura do webhook Resend
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Resend usa o padrão Svix que é compatível com HMAC SHA256
    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('base64');
    
    // O header svix-signature pode ter múltiplas versões: v1,hash v2,hash
    const signatures = signature.split(' ').map(s => s.split(',')[1]);
    
    return signatures.some(sig => sig === expectedSignature);
  } catch (error) {
    console.error('❌ [RESEND-WEBHOOK] Erro ao verificar assinatura:', error);
    return false;
  }
}

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id?: string;
    from?: string;
    to?: string[];
    subject?: string;
    created_at?: string;
    [key: string]: any;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log('📬 [RESEND-WEBHOOK] Webhook recebido');

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Ler o body uma única vez
    const payload = await req.text();

    // Verificar assinatura do webhook (segurança)
    if (webhookSecret) {
      const signature = req.headers.get('svix-signature');
      
      if (!signature || !verifyWebhookSignature(payload, signature, webhookSecret)) {
        console.error('❌ [RESEND-WEBHOOK] Assinatura inválida - possível tentativa de ataque');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('✅ [RESEND-WEBHOOK] Assinatura válida');
    }

    // Parse do JSON a partir do payload já lido
    const event: ResendWebhookEvent = JSON.parse(payload);
    console.log('📧 [RESEND-WEBHOOK] Evento recebido:', event.type);

    // Mapear tipos de eventos do Resend para nosso formato
    const eventTypeMap: { [key: string]: string } = {
      'email.sent': 'sent',
      'email.delivered': 'delivered',
      'email.delivery_delayed': 'delivery_delayed',
      'email.bounced': 'bounced',
      'email.opened': 'opened',
      'email.clicked': 'clicked',
      'email.complained': 'complained',
    };

    const eventType = eventTypeMap[event.type];
    
    if (!eventType) {
      console.log('⚠️ [RESEND-WEBHOOK] Tipo de evento ignorado:', event.type);
      return new Response(
        JSON.stringify({ success: true, message: 'Event type ignored' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailId = event.data.email_id;
    
    if (!emailId) {
      console.warn('⚠️ [RESEND-WEBHOOK] Email ID não encontrado no evento');
      return new Response(
        JSON.stringify({ success: true, message: 'No email ID in event' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar convite pelo email_id
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('id')
      .eq('email_id', emailId)
      .maybeSingle();

    if (inviteError) {
      console.error('❌ [RESEND-WEBHOOK] Erro ao buscar convite:', inviteError);
      throw inviteError;
    }

    if (!invite) {
      console.log('⚠️ [RESEND-WEBHOOK] Convite não encontrado para email_id:', emailId);
      // Não é erro - pode ser um email que não é de convite
      return new Response(
        JSON.stringify({ success: true, message: 'Invite not found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ [RESEND-WEBHOOK] Convite encontrado:', invite.id);

    // Inserir evento de delivery
    const { error: insertError } = await supabase
      .from('invite_delivery_events')
      .insert({
        invite_id: invite.id,
        event_type: eventType,
        email_id: emailId,
        channel: 'email',
        event_data: event.data,
      });

    if (insertError) {
      console.error('❌ [RESEND-WEBHOOK] Erro ao inserir evento:', insertError);
      throw insertError;
    }

    console.log('✅ [RESEND-WEBHOOK] Evento registrado com sucesso:', eventType);

    return new Response(
      JSON.stringify({ 
        success: true, 
        event_type: eventType,
        invite_id: invite.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ [RESEND-WEBHOOK] Erro:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to process webhook'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
