import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessInviteRequest {
  inviteId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('⚡ [PROCESS-INVITE] Iniciando processamento automático...');

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
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ProcessInviteRequest = await req.json();
    console.log('📋 [PROCESS-INVITE] Processando convite:', body.inviteId);

    // Buscar dados completos do convite
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select(`
        *,
        user_roles (
          name,
          description
        )
      `)
      .eq('id', body.inviteId)
      .single();

    if (inviteError || !invite) {
      throw new Error(`Convite não encontrado: ${inviteError?.message}`);
    }

    // Preparar dados para as Edge Functions
    const inviteUrl = `https://app.viverdeia.ai/invite?token=${invite.token}`;
    
    const emailData = {
      inviteId: invite.id,
      email: invite.email,
      token: invite.token,
      inviteUrl: inviteUrl,
      roleName: invite.user_roles?.name || 'Membro',
      senderName: 'Administrador',
      expiresAt: invite.expires_at,
      notes: invite.notes,
    };

    console.log('📧 [PROCESS-INVITE] Enviando email para:', invite.email);

    // Enviar email (sempre)
    const emailResponse = await supabase.functions.invoke('send-invite-email', {
      body: emailData
    });

    if (emailResponse.error) {
      console.error('❌ [PROCESS-INVITE] Erro no envio de email:', emailResponse.error);
    } else {
      console.log('✅ [PROCESS-INVITE] Email enviado com sucesso');
    }

    // Enviar WhatsApp se configurado
    let whatsappResult = null;
    if (invite.whatsapp_number && invite.preferred_channel !== 'email') {
      console.log('📱 [PROCESS-INVITE] Enviando WhatsApp para:', invite.whatsapp_number);
      
      const whatsappData = {
        ...emailData,
        phone: invite.whatsapp_number,
        recipientName: invite.email,
      };

      const whatsappResponse = await supabase.functions.invoke('send-whatsapp-invite', {
        body: whatsappData
      });

      if (whatsappResponse.error) {
        console.error('❌ [PROCESS-INVITE] Erro no envio de WhatsApp:', whatsappResponse.error);
      } else {
        console.log('✅ [PROCESS-INVITE] WhatsApp enviado com sucesso');
        whatsappResult = whatsappResponse.data;
      }
    }

    // Atualizar convite com tentativa de envio
    await supabase
      .from('invites')
      .update({
        send_attempts: (invite.send_attempts || 0) + 1,
        last_sent_at: new Date().toISOString()
      })
      .eq('id', invite.id);

    return new Response(
      JSON.stringify({
        success: true,
        invite_id: invite.id,
        email_sent: !emailResponse.error,
        whatsapp_sent: !!whatsappResult,
        processed_at: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ [PROCESS-INVITE] Erro geral:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Falha no processamento automático do convite'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);