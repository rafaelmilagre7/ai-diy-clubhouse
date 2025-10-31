import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'https://esm.sh/resend@4.0.0';
import { getSecureCorsHeaders, isOriginAllowed, forbiddenOriginResponse } from '../_shared/secureCors.ts';

declare const EdgeRuntime: { waitUntil: (promise: Promise<any>) => void };

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
  const corsHeaders = getSecureCorsHeaders(req);
  
  console.log('🚀 [SEND-INVITE-EMAIL-OPTIMIZED] Processamento iniciado - v3.0');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 🔒 VALIDAÇÃO CORS: Bloquear origens não confiáveis
  if (!isOriginAllowed(req)) {
    console.warn('[SECURITY] Origem não autorizada bloqueada:', req.headers.get('origin'));
    return forbiddenOriginResponse();
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
      // Template HTML simples para convite
      const templateHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Convite Viver de IA</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚀 Bem-vindo à Viver de IA!</h1>
            <p>Você foi convidado para nossa plataforma</p>
          </div>
          <div class="content">
            <p>Olá!</p>
            <p>Você foi convidado para fazer parte da <strong>Viver de IA</strong> como <strong>${templateData.roleName}</strong>.</p>
            <p>Clique no botão abaixo para ativar sua conta:</p>
            <p><a href="${templateData.inviteUrl}" class="button">Ativar Conta</a></p>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">${templateData.inviteUrl}</p>
            <p><small>Este convite expira em: ${new Date(templateData.expiresAt).toLocaleDateString('pt-BR')}</small></p>
            ${templateData.notes ? `<p><em>Observações: ${templateData.notes}</em></p>` : ''}
          </div>
          <div class="footer">
            <p>© 2024 Viver de IA - Todos os direitos reservados</p>
          </div>
        </body>
        </html>
      `;

      const { data: emailResult, error: emailError } = await resend.emails.send({
        from: 'Viver de IA <convites@viverdeia.ai>',
        to: [body.email],
        subject: `🚀 Você foi convidado para a plataforma Viver de IA!`,
        html: templateHtml,
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
    
    // Registrar evento de envio
    if (messageId) {
      await supabase
        .from('invite_delivery_events')
        .insert({
          invite_id: inviteId,
          event_type: 'sent',
          email_id: messageId,
          channel: 'email',
          event_data: {
            recipient: email,
            sent_at: new Date().toISOString()
          }
        });
    }

    // Atualizar convite com email_id e estatísticas
    const updateData: any = {
      last_sent_at: new Date().toISOString()
    };
    
    if (messageId) {
      updateData.email_id = messageId;
    }

    await supabase
      .from('invites')
      .update(updateData)
      .eq('id', inviteId);

    // Incrementar send_attempts usando RPC
    await supabase.rpc('increment_invite_send_attempts', {
      invite_id_param: inviteId
    });

    console.log('✅ [BACKGROUND] Estatísticas atualizadas com email_id:', messageId);
  } catch (bgError: any) {
    console.error('❌ [BACKGROUND] Erro ao atualizar:', bgError);
  }
}

serve(handler);