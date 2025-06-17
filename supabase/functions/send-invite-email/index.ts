
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendInviteEmailRequest {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string;
  forceResend?: boolean;
}

const createProfessionalEmailTemplate = (data: {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
}) => {
  const expirationDate = new Date(data.expiresAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Convite - Viver de IA</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Viver de IA</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Você foi convidado!</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-bottom: 20px; font-size: 24px;">Olá!</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px; color: #555;">
              ${data.senderName ? `${data.senderName} convidou você para` : 'Você foi convidado a'} fazer parte da plataforma <strong>Viver de IA</strong> como <strong>${data.roleName}</strong>.
            </p>
            
            ${data.notes ? `
              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-style: italic; color: #666;">
                  "${data.notes}"
                </p>
              </div>
            ` : ''}
            
            <p style="font-size: 16px; margin-bottom: 30px; color: #555;">
              Clique no botão abaixo para aceitar o convite e criar sua conta:
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; font-size: 16px; transition: all 0.3s ease;">
                Aceitar Convite
              </a>
            </div>
            
            <p style="font-size: 14px; color: #777; margin-top: 30px;">
              <strong>Importante:</strong> Este convite expira em <strong>${expirationDate}</strong>.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #888; margin-bottom: 10px;">
              Se você não conseguir clicar no botão, copie e cole o link abaixo no seu navegador:
            </p>
            <p style="font-size: 12px; color: #0066cc; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
              ${data.inviteUrl}
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; font-size: 12px; color: #6c757d;">
              Este é um convite oficial da plataforma Viver de IA.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #6c757d;">
              Se você não esperava este convite, pode ignorar este email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🚀 [INVITE-EMAIL] Iniciando processamento...');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuração do Supabase incompleta');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: SendInviteEmailRequest = await req.json();
    
    console.log('📧 [INVITE-EMAIL] Dados recebidos:', {
      email: body.email,
      roleName: body.roleName,
      hasResendKey: !!resendApiKey,
      inviteId: body.inviteId
    });

    // Registrar tentativa de envio
    if (body.inviteId) {
      await supabase.from('invite_send_attempts').insert({
        invite_id: body.inviteId,
        email: body.email,
        method_attempted: 'resend_primary',
        status: 'attempting'
      });
    }

    // Estratégia 1: Resend (Principal)
    if (resendApiKey) {
      try {
        console.log('📬 [RESEND] Tentando envio via Resend...');
        const resend = new Resend(resendApiKey);
        
        const emailHtml = createProfessionalEmailTemplate({
          email: body.email,
          inviteUrl: body.inviteUrl,
          roleName: body.roleName,
          expiresAt: body.expiresAt,
          senderName: body.senderName,
          notes: body.notes
        });

        const emailResponse = await resend.emails.send({
          from: "Viver de IA <convites@viverdeia.ai>",
          to: [body.email],
          subject: `Convite para ${body.roleName} - Viver de IA`,
          html: emailHtml,
          tags: [
            { name: 'type', value: 'invite' },
            { name: 'role', value: body.roleName },
          ],
        });

        console.log('✅ [RESEND] Email enviado com sucesso:', emailResponse.data?.id);

        // Atualizar tentativa como sucesso
        if (body.inviteId) {
          await supabase.from('invite_send_attempts').insert({
            invite_id: body.inviteId,
            email: body.email,
            method_attempted: 'resend_primary',
            status: 'sent',
            email_id: emailResponse.data?.id,
            sent_at: new Date().toISOString()
          });
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Convite enviado com sucesso via Resend',
          strategy: 'resend_primary',
          method: 'resend',
          email: body.email,
          emailId: emailResponse.data?.id
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });

      } catch (resendError: any) {
        console.error('❌ [RESEND] Falha:', resendError);
        
        // Registrar falha
        if (body.inviteId) {
          await supabase.from('invite_send_attempts').insert({
            invite_id: body.inviteId,
            email: body.email,
            method_attempted: 'resend_primary',
            status: 'failed',
            error_message: resendError.message
          });
        }
      }
    }

    // Estratégia 2: Supabase Auth (Fallback)
    console.log('🔄 [FALLBACK] Tentando via Supabase Auth...');
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
        body.email,
        {
          data: {
            role: body.roleName,
            invite_url: body.inviteUrl,
            sender_name: body.senderName,
            notes: body.notes
          }
        }
      );

      if (authError) throw authError;

      console.log('✅ [SUPABASE-AUTH] Convite enviado via Supabase Auth');

      // Registrar sucesso
      if (body.inviteId) {
        await supabase.from('invite_send_attempts').insert({
          invite_id: body.inviteId,
          email: body.email,
          method_attempted: 'supabase_auth',
          status: 'sent',
          sent_at: new Date().toISOString()
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Convite enviado via Supabase Auth',
        strategy: 'supabase_auth',
        method: 'supabase',
        email: body.email
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } catch (authError: any) {
      console.error('❌ [SUPABASE-AUTH] Falha:', authError);
      
      // Registrar falha
      if (body.inviteId) {
        await supabase.from('invite_send_attempts').insert({
          invite_id: body.inviteId,
          email: body.email,
          method_attempted: 'supabase_auth',
          status: 'failed',
          error_message: authError.message
        });
      }
    }

    // Estratégia 3: Reset Password (Último recurso)
    console.log('🔄 [LAST-RESORT] Tentando envio de reset...');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        body.email,
        {
          redirectTo: body.inviteUrl
        }
      );

      if (resetError) throw resetError;

      console.log('✅ [RESET] Link de reset enviado');

      // Registrar sucesso
      if (body.inviteId) {
        await supabase.from('invite_send_attempts').insert({
          invite_id: body.inviteId,
          email: body.email,
          method_attempted: 'password_reset',
          status: 'sent',
          sent_at: new Date().toISOString()
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Link de acesso enviado via reset de senha',
        strategy: 'supabase_recovery',
        method: 'password_reset',
        email: body.email
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } catch (resetError: any) {
      console.error('❌ [RESET] Falha:', resetError);
      
      // Registrar falha final
      if (body.inviteId) {
        await supabase.from('invite_send_attempts').insert({
          invite_id: body.inviteId,
          email: body.email,
          method_attempted: 'password_reset',
          status: 'failed',
          error_message: resetError.message
        });
      }
    }

    // Todas as estratégias falharam
    console.error('❌ [CRITICAL] Todas as estratégias de envio falharam');
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Todas as estratégias de envio falharam',
      error: 'Falha completa do sistema de email'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('❌ [CRITICAL] Erro crítico:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Erro crítico no processamento',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);
