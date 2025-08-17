import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResendWebhookEvent {
  type: 'email.sent' | 'email.delivered' | 'email.delivery_delayed' | 'email.complained' | 'email.bounced' | 'email.opened' | 'email.clicked';
  created_at: string;
  data: {
    id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    email_id?: string;
    click?: {
      url: string;
      timestamp: string;
    };
    open?: {
      timestamp: string;
      user_agent?: string;
      ip_address?: string;
    };
    bounce?: {
      type: 'hard' | 'soft';
      code: string;
      message: string;
    };
    complaint?: {
      type: string;
      timestamp: string;
    };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const webhookSignature = req.headers.get('resend-webhook-signature');
    const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET');
    
    // TODO: Verificar assinatura do webhook se necessário
    // if (webhookSecret && !verifyWebhookSignature(body, webhookSignature, webhookSecret)) {
    //   throw new Error('Invalid webhook signature');
    // }

    const event: ResendWebhookEvent = await req.json();
    
    console.log('📧 [RESEND-WEBHOOK] Evento recebido:', {
      type: event.type,
      email_id: event.data.id,
      to: event.data.to,
      timestamp: event.created_at
    });

    // Buscar o convite pelo provider_id (email ID do Resend)
    const { data: delivery } = await supabase
      .from('invite_deliveries')
      .select('*')
      .eq('provider_id', event.data.id)
      .single();

    if (!delivery) {
      console.log('⚠️ [RESEND-WEBHOOK] Delivery não encontrado para email_id:', event.data.id);
      return new Response(JSON.stringify({ success: true, message: 'Delivery not found, but ok' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Mapear tipos de evento para status
    let newStatus = delivery.status;
    let metadata = delivery.metadata || {};
    
    switch (event.type) {
      case 'email.sent':
        newStatus = 'sent';
        metadata = {
          ...metadata,
          sent_at: event.created_at,
          resend_event: event.type
        };
        break;
        
      case 'email.delivered':
        newStatus = 'delivered';
        metadata = {
          ...metadata,
          delivered_at: event.created_at,
          resend_event: event.type
        };
        break;
        
      case 'email.opened':
        newStatus = 'opened';
        metadata = {
          ...metadata,
          opened_at: event.created_at,
          open_count: (metadata.open_count || 0) + 1,
          last_open: {
            timestamp: event.created_at,
            user_agent: event.data.open?.user_agent,
            ip_address: event.data.open?.ip_address
          },
          resend_event: event.type
        };
        break;
        
      case 'email.clicked':
        newStatus = 'clicked';
        metadata = {
          ...metadata,
          clicked_at: event.created_at,
          click_count: (metadata.click_count || 0) + 1,
          last_click: {
            timestamp: event.created_at,
            url: event.data.click?.url
          },
          resend_event: event.type
        };
        break;
        
      case 'email.bounced':
        newStatus = 'bounced';
        metadata = {
          ...metadata,
          bounced_at: event.created_at,
          bounce_type: event.data.bounce?.type,
          bounce_code: event.data.bounce?.code,
          bounce_message: event.data.bounce?.message,
          resend_event: event.type
        };
        break;
        
      case 'email.complained':
        newStatus = 'complained';
        metadata = {
          ...metadata,
          complained_at: event.created_at,
          complaint_type: event.data.complaint?.type,
          resend_event: event.type
        };
        break;
        
      case 'email.delivery_delayed':
        // Não muda o status, só adiciona metadata
        metadata = {
          ...metadata,
          delivery_delayed_at: event.created_at,
          resend_event: event.type
        };
        break;
    }

    // Atualizar o delivery na base de dados
    const { error: updateError } = await supabase
      .from('invite_deliveries')
      .update({
        status: newStatus,
        metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', delivery.id);

    if (updateError) {
      console.error('❌ [RESEND-WEBHOOK] Erro ao atualizar delivery:', updateError);
      throw updateError;
    }

    console.log('✅ [RESEND-WEBHOOK] Delivery atualizado:', {
      delivery_id: delivery.id,
      old_status: delivery.status,
      new_status: newStatus,
      event_type: event.type
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Webhook processado com sucesso',
      delivery_id: delivery.id,
      new_status: newStatus
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ [RESEND-WEBHOOK] Erro:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});