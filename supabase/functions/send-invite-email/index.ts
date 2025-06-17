
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      inviteUrl,
      roleName,
      expiresAt,
      senderName = 'Equipe Viver de IA',
      notes,
      inviteId,
      forceResend = true
    }: InviteEmailRequest = await req.json();

    console.log('📧 [INVITE-EMAIL] Dados recebidos:', { email, roleName, hasNotes: !!notes });

    // Validações básicas
    if (!email || !inviteUrl) {
      throw new Error('Email e URL do convite são obrigatórios');
    }

    // Configurar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Estratégia 1: Tentar Resend (sistema principal)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey) {
      console.log('📮 [INVITE-EMAIL] Tentando Resend...');
      
      try {
        const resend = new Resend(resendApiKey);
        
        const expirationDate = new Date(expiresAt).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });

        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Convite - Viver de IA</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
                .highlight { background: #f0f4f8; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Você foi convidado!</h1>
                  <p>Bem-vindo à comunidade Viver de IA</p>
                </div>
                
                <div class="content">
                  <p>Olá! 👋</p>
                  
                  <p><strong>${senderName}</strong> convidou você para fazer parte da <strong>Viver de IA</strong>, uma plataforma exclusiva para quem quer dominar a Inteligência Artificial.</p>
                  
                  <div class="highlight">
                    <strong>Seu papel:</strong> ${roleName}<br>
                    ${notes ? `<strong>Mensagem:</strong> ${notes}<br>` : ''}
                    <strong>Válido até:</strong> ${expirationDate}
                  </div>
                  
                  <p>Clique no botão abaixo para aceitar o convite e criar sua conta:</p>
                  
                  <div style="text-align: center;">
                    <a href="${inviteUrl}" class="button">🚀 Aceitar Convite</a>
                  </div>
                  
                  <p><small>Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                  <a href="${inviteUrl}">${inviteUrl}</a></small></p>
                  
                  <p>Estamos ansiosos para tê-lo conosco! 🎯</p>
                </div>
                
                <div class="footer">
                  <p>© 2024 Viver de IA - Transformando o futuro com Inteligência Artificial</p>
                  <p>Este convite expira em ${expirationDate}</p>
                </div>
              </div>
            </body>
          </html>
        `;

        const emailResponse = await resend.emails.send({
          from: 'Viver de IA <noreply@viverdeai.com>',
          to: [email],
          subject: `🎉 Você foi convidado para a Viver de IA - ${roleName}`,
          html: htmlContent,
        });

        console.log('✅ [INVITE-EMAIL] Resend sucesso:', emailResponse.id);

        return new Response(JSON.stringify({
          success: true,
          strategy: 'resend_primary',
          method: 'resend',
          email: email,
          emailId: emailResponse.id
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });

      } catch (resendError) {
        console.error('❌ [INVITE-EMAIL] Resend falhou:', resendError);
        // Continuar para estratégias de fallback
      }
    }

    // Estratégia 2: Fallback - Supabase Auth (usuário existente)
    console.log('🔄 [INVITE-EMAIL] Tentando Supabase Auth fallback...');
    
    try {
      // Tentar enviar link de recuperação como fallback
      const { error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: inviteUrl,
          data: {
            invite_role: roleName,
            invite_notes: notes,
            invited_by: senderName
          }
        }
      });

      if (!resetError) {
        console.log('✅ [INVITE-EMAIL] Supabase Auth recovery sucesso');
        
        return new Response(JSON.stringify({
          success: true,
          strategy: 'supabase_recovery',
          method: 'supabase_auth',
          email: email
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Se recovery falhar, tentar invite
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: inviteUrl,
        data: {
          role: roleName,
          invite_notes: notes,
          invited_by: senderName
        }
      });

      if (!inviteError) {
        console.log('✅ [INVITE-EMAIL] Supabase Auth invite sucesso');
        
        return new Response(JSON.stringify({
          success: true,
          strategy: 'supabase_auth',
          method: 'supabase_invite',
          email: email
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      throw new Error(`Supabase Auth falhou: ${resetError?.message || inviteError?.message}`);

    } catch (supabaseError) {
      console.error('❌ [INVITE-EMAIL] Supabase Auth falhou:', supabaseError);
    }

    // Se chegou aqui, todas as estratégias falharam
    throw new Error('Todas as estratégias de envio falharam');

  } catch (error: any) {
    console.error('❌ [INVITE-EMAIL] Erro crítico:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Falha no sistema de envio de convites'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);
