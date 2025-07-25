import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { InviteEmail } from './_templates/invite-email.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendInviteEmailRequest {
  inviteId: string;
  email: string;
  inviteUrl: string;
  roleName: string;
  senderName: string;
  expiresAt: string;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 [SEND-INVITE-EMAIL] Processamento iniciado - v2.0');

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
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não configurado');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const body: SendInviteEmailRequest = await req.json();
    console.log('📧 [SEND-INVITE-EMAIL] Dados recebidos:', {
      email: body.email,
      roleName: body.roleName,
      invitedBy: body.senderName,
      inviteUrl: body.inviteUrl
    });

    // Usar a URL do convite fornecida
    const inviteUrl = body.inviteUrl;
    
    console.log('🔗 [SEND-INVITE-EMAIL] URL do convite:', inviteUrl);

    // Verificar dados do template antes de renderizar
    const templateData = {
      inviteUrl,
      invitedByName: body.senderName,
      recipientEmail: body.email,
      roleName: body.roleName,
      companyName: 'Viver de IA',
      expiresAt: body.expiresAt,
      notes: body.notes,
    };
    
    console.log('📋 [SEND-INVITE-EMAIL] Dados do template:', templateData);

    // Renderizar template do email
    const emailHtml = await renderAsync(
      React.createElement(InviteEmail, templateData)
    );

    console.log('📝 [SEND-INVITE-EMAIL] Template renderizado com sucesso');

    // Enviar email via Resend
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: 'Viver de IA <convites@viverdeia.ai>',
      to: [body.email],
      subject: `🚀 Você foi convidado para a plataforma Viver de IA!`,
      html: emailHtml,
      replyTo: 'suporte@viverdeia.ai',
    });

    if (emailError) {
      console.error('❌ [SEND-INVITE-EMAIL] Erro no Resend:', emailError);
      throw emailError;
    }

    console.log('✅ [SEND-INVITE-EMAIL] Email enviado com sucesso:', emailResult?.id);

    // Registrar delivery no banco
    const { error: deliveryError } = await supabase
      .from('invite_deliveries')
      .insert({
        invite_id: body.inviteId,
        channel: 'email',
        status: 'sent',
        provider_id: emailResult?.id,
        sent_at: new Date().toISOString(),
        metadata: {
          resend_id: emailResult?.id,
          recipient: body.email,
          template: 'invite-email',
        }
      });

    if (deliveryError) {
      console.warn('⚠️ [SEND-INVITE-EMAIL] Erro ao registrar delivery:', deliveryError);
    }

    // Atualizar estatísticas do convite
    const { error: updateError } = await supabase
      .from('invites')
      .update({
        send_attempts: 1,
        last_sent_at: new Date().toISOString()
      })
      .eq('id', body.inviteId);

    if (updateError) {
      console.warn('⚠️ [SEND-INVITE-EMAIL] Erro ao atualizar convite:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: emailResult?.id,
        sentAt: new Date().toISOString(),
        recipient: body.email
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ [SEND-INVITE-EMAIL] Erro geral:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Falha no envio do email de convite'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);