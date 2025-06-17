
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteEmailRequest {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string;
  forceResend?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 [INVITE-EMAIL] Iniciando processamento...');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    console.log('🔧 [INVITE-EMAIL] Configurações:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasResendKey: !!resendApiKey
    });

    if (!resendApiKey) {
      console.error('❌ [INVITE-EMAIL] RESEND_API_KEY não configurada');
      throw new Error('Configuração de email não encontrada');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const {
      email,
      inviteUrl,
      roleName,
      expiresAt,
      senderName = 'Viver de IA',
      notes,
      inviteId,
      forceResend = false
    }: InviteEmailRequest = await req.json();

    console.log('📧 [INVITE-EMAIL] Dados recebidos:', { 
      email, 
      roleName, 
      hasInviteUrl: !!inviteUrl,
      inviteId
    });

    // Validação básica
    if (!email || !inviteUrl || !roleName) {
      throw new Error('Dados obrigatórios não fornecidos');
    }

    // Registrar tentativa de envio
    if (inviteId) {
      try {
        await supabase
          .from('invite_send_attempts')
          .insert({
            invite_id: inviteId,
            email,
            method_attempted: 'resend_primary',
            status: 'attempting'
          });
        console.log('📝 [INVITE-EMAIL] Tentativa registrada');
      } catch (dbError) {
        console.warn('⚠️ [INVITE-EMAIL] Erro ao registrar tentativa:', dbError);
      }
    }

    // ESTRATÉGIA 1: Tentar Resend (método principal)
    try {
      console.log('📨 [INVITE-EMAIL] Estratégia 1: Enviando via Resend...');
      
      const expirationDate = new Date(expiresAt);
      const formattedDate = expirationDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const emailHtml = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Convite para Viver de IA</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🚀 Bem-vindo à Viver de IA!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Você foi convidado!</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Olá! ${senderName} convidou você para se juntar à <strong>Viver de IA</strong> como <strong>${roleName}</strong>.
            </p>
            
            ${notes ? `
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
                <p style="margin: 0; font-style: italic;">"${notes}"</p>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                ✨ Aceitar Convite
              </a>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
              <p style="margin: 0; color: #856404;">
                ⏰ <strong>Este convite expira em:</strong> ${formattedDate}
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #6c757d; text-align: center;">
              Se você não conseguir clicar no botão, copie e cole este link no seu navegador:<br>
              <a href="${inviteUrl}" style="color: #667eea; word-break: break-all;">${inviteUrl}</a>
            </p>
            
            <p style="font-size: 12px; color: #868e96; text-align: center; margin-top: 30px;">
              Este email foi enviado automaticamente pelo sistema Viver de IA.<br>
              Se você recebeu este email por engano, pode ignorá-lo com segurança.
            </p>
          </div>
        </body>
        </html>
      `;

      const emailResponse = await resend.emails.send({
        from: 'Viver de IA <noreply@viverdeia.ai>',
        to: [email],
        subject: `🚀 Convite para Viver de IA - ${roleName}`,
        html: emailHtml,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        }
      });

      console.log('✅ [INVITE-EMAIL] Resend sucesso:', emailResponse);

      // Atualizar status da tentativa
      if (inviteId) {
        try {
          await supabase
            .from('invite_send_attempts')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              email_id: emailResponse.data?.id
            })
            .eq('invite_id', inviteId)
            .eq('status', 'attempting');
        } catch (updateError) {
          console.warn('⚠️ [INVITE-EMAIL] Erro ao atualizar tentativa:', updateError);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Email enviado com sucesso via Resend',
        emailId: emailResponse.data?.id,
        strategy: 'resend_primary',
        method: 'resend'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } catch (resendError) {
      console.error('❌ [INVITE-EMAIL] Resend falhou:', resendError);

      // ESTRATÉGIA 2: Fallback para Supabase Auth
      try {
        console.log('🔄 [INVITE-EMAIL] Estratégia 2: Tentando Supabase Auth...');

        const { error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
          redirectTo: inviteUrl,
          data: {
            role: roleName,
            invite_notes: notes,
            invited_by: senderName
          }
        });

        if (authError) {
          throw authError;
        }

        console.log('✅ [INVITE-EMAIL] Supabase Auth sucesso');

        // Atualizar status da tentativa
        if (inviteId) {
          try {
            await supabase
              .from('invite_send_attempts')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
                method_attempted: 'supabase_auth'
              })
              .eq('invite_id', inviteId)
              .eq('status', 'attempting');
          } catch (updateError) {
            console.warn('⚠️ [INVITE-EMAIL] Erro ao atualizar tentativa:', updateError);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Email enviado via sistema de backup (Supabase Auth)',
          strategy: 'supabase_recovery',
          method: 'supabase_auth'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });

      } catch (authFallbackError) {
        console.error('❌ [INVITE-EMAIL] Supabase Auth também falhou:', authFallbackError);

        // ESTRATÉGIA 3: Reset Password como último recurso
        try {
          console.log('🔄 [INVITE-EMAIL] Estratégia 3: Tentando Reset Password...');

          const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: inviteUrl
          });

          if (resetError) {
            throw resetError;
          }

          console.log('✅ [INVITE-EMAIL] Reset Password sucesso');

          // Atualizar status da tentativa
          if (inviteId) {
            try {
              await supabase
                .from('invite_send_attempts')
                .update({
                  status: 'sent',
                  sent_at: new Date().toISOString(),
                  method_attempted: 'password_reset'
                })
                .eq('invite_id', inviteId)
                .eq('status', 'attempting');
            } catch (updateError) {
              console.warn('⚠️ [INVITE-EMAIL] Erro ao atualizar tentativa:', updateError);
            }
          }

          return new Response(JSON.stringify({
            success: true,
            message: 'Email enviado via reset de senha (último recurso)',
            strategy: 'password_reset',
            method: 'password_reset'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });

        } catch (resetError) {
          console.error('❌ [INVITE-EMAIL] Todas as estratégias falharam');

          // Registrar falha completa
          if (inviteId) {
            try {
              await supabase
                .from('invite_send_attempts')
                .update({
                  status: 'failed',
                  error_message: `Resend: ${resendError.message}, Auth: ${authFallbackError.message}, Reset: ${resetError.message}`,
                  retry_after: new Date(Date.now() + 5 * 60 * 1000).toISOString()
                })
                .eq('invite_id', inviteId)
                .eq('status', 'attempting');
            } catch (updateError) {
              console.warn('⚠️ [INVITE-EMAIL] Erro ao registrar falha:', updateError);
            }
          }

          throw new Error(`Todas as estratégias falharam - Resend: ${resendError.message}, Auth: ${authFallbackError.message}, Reset: ${resetError.message}`);
        }
      }
    }

  } catch (error: any) {
    console.error('❌ [INVITE-EMAIL] Erro crítico:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Falha ao enviar convite por email'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);
