import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { InviteEmail } from './_templates/invite-email.tsx';

declare const EdgeRuntime: { waitUntil: (promise: Promise<any>) => void };

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
  console.log('🚀 [SEND-INVITE-EMAIL-OPTIMIZED] Processamento iniciado - v3.0');

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
      hasInviteId: !!body.inviteId
    });

    // VALIDAÇÃO RÁPIDA
    if (!body.inviteUrl || !body.inviteUrl.includes('/convite/')) {
      throw new Error('URL de convite inválida');
    }

    // PREPARAR TEMPLATE
    const templateData = {
      inviteUrl: body.inviteUrl,
      invitedByName: body.senderName || 'Equipe Viver de IA',
      recipientEmail: body.email,
      roleName: body.roleName,
      companyName: 'Viver de IA',
      expiresAt: body.expiresAt,
      notes: body.notes,
    };

    // RENDERIZAR E ENVIAR (com timeout de 8s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const emailHtml = await renderAsync(
        React.createElement(InviteEmail, templateData)
      );

      const { data: emailResult, error: emailError } = await resend.emails.send({
        from: 'Viver de IA <convites@viverdeia.ai>',
        to: [body.email],
        subject: `🚀 Você foi convidado para a plataforma Viver de IA!`,
        html: emailHtml,
        replyTo: 'suporte@viverdeia.ai',
      });

      clearTimeout(timeoutId);

      if (emailError) {
        console.error('❌ [SEND-INVITE-EMAIL] Erro no Resend:', emailError);
        throw emailError;
      }

      console.log('✅ [SEND-INVITE-EMAIL] Email enviado:', emailResult?.id);

      // REGISTRAR LOGS EM BACKGROUND para resposta IMEDIATA
      if (EdgeRuntime?.waitUntil && body.inviteId) {
        EdgeRuntime.waitUntil(
          updateInviteStatsInBackground(supabase, body.inviteId, emailResult?.id, body.email)
        );
      }

      // RESPOSTA IMEDIATA
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

    } catch (sendError: any) {
      clearTimeout(timeoutId);
      
      if (sendError.name === 'AbortError') {
        throw new Error('Timeout no envio de email (8s)');
      }
      throw sendError;
    }

  } catch (error: any) {
    console.error('❌ [SEND-INVITE-EMAIL] Erro geral:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
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

// FUNÇÃO DE BACKGROUND PARA LOGS
async function updateInviteStatsInBackground(
  supabase: any, 
  inviteId: string, 
  messageId: string | undefined, 
  email: string
) {
  try {
    console.log('🔄 [BACKGROUND] Atualizando estatísticas...');
    
    // Registrar delivery
    await supabase
      .from('invite_deliveries')
      .insert({
        invite_id: inviteId,
        channel: 'email',
        status: 'sent',
        provider_id: messageId,
        sent_at: new Date().toISOString(),
        metadata: {
          resend_id: messageId,
          recipient: email,
          template: 'invite-email',
        }
      });

    // Atualizar estatísticas
    await supabase
      .from('invites')
      .update({
        send_attempts: 1,
        last_sent_at: new Date().toISOString()
      })
      .eq('id', inviteId);

    console.log('✅ [BACKGROUND] Estatísticas atualizadas');
  } catch (bgError: any) {
    console.error('❌ [BACKGROUND] Erro ao atualizar:', bgError);
  }
}

serve(handler);