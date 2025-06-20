
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { Resend } from 'npm:resend@2.0.0'

console.log('📧 [INVITE-EMAIL] Edge Function carregada e pronta!');

// Configuração de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Inicializar Resend
const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

interface InviteEmailRequest {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string;
  forceResend?: boolean;
  requestId?: string;
}

function generateEmailHTML(data: InviteEmailRequest): string {
  const expirationDate = new Date(data.expiresAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Convite para Plataforma</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Você foi convidado!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
        <p style="font-size: 18px; margin-bottom: 20px;">Olá!</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          <strong>${data.senderName || 'Administrador'}</strong> convidou você para acessar nossa plataforma com o papel de <strong>${data.roleName}</strong>.
        </p>
        
        ${data.notes ? `
          <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
            <p style="margin: 0; font-style: italic;">"${data.notes}"</p>
          </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.inviteUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
            🚀 Aceitar Convite
          </a>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffeaa7;">
          <p style="margin: 0; font-size: 14px; color: #856404;">
            ⏰ <strong>Importante:</strong> Este convite expira em <strong>${expirationDate}</strong>
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
          Se o botão não funcionar, copie e cole este link no seu navegador:
        </p>
        <p style="font-size: 12px; color: #888; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
          ${data.inviteUrl}
        </p>
        
        <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
          Se você não estava esperando este convite, pode ignorar este email.
        </p>
      </div>
    </body>
    </html>
  `;
}

// Função principal
Deno.serve(async (req) => {
  // Lidar com requisição OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const requestId = crypto.randomUUID().substring(0, 8);
    console.log(`📧 [INVITE-${requestId}] Nova requisição de convite por email`);

    // Verificar se é POST
    if (req.method !== 'POST') {
      console.error(`❌ [INVITE-${requestId}] Método não permitido: ${req.method}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Método não permitido' 
        }),
        { 
          status: 405, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    // Verificar variáveis de ambiente
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error(`❌ [INVITE-${requestId}] RESEND_API_KEY não configurada`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Configuração de email não encontrada' 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    // Obter dados da requisição
    const requestData: InviteEmailRequest = await req.json()
    console.log(`📧 [INVITE-${requestId}] Dados recebidos:`, {
      email: requestData.email,
      roleName: requestData.roleName,
      hasInviteUrl: !!requestData.inviteUrl,
      urlPreview: requestData.inviteUrl?.substring(0, 50) + '...',
      inviteId: requestData.inviteId
    });

    // Validar dados obrigatórios
    if (!requestData.email || !requestData.inviteUrl || !requestData.roleName) {
      console.error(`❌ [INVITE-${requestId}] Dados obrigatórios faltando`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Dados obrigatórios faltando (email, inviteUrl, roleName)' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    // Configurar Supabase para atualizar estatísticas
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    let supabase = null;
    
    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey)
    }

    // Enviar email via Resend
    console.log(`📧 [INVITE-${requestId}] Enviando email via Resend...`);
    
    const emailResponse = await resend.emails.send({
      from: 'Plataforma <noreply@resend.dev>', // Substitua pelo seu domínio verificado
      to: [requestData.email],
      subject: `🎉 Você foi convidado! Acesso como ${requestData.roleName}`,
      html: generateEmailHTML(requestData),
    })

    if (emailResponse.error) {
      console.error(`❌ [INVITE-${requestId}] Erro do Resend:`, emailResponse.error);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Falha no envio do email',
          error: emailResponse.error.message,
          strategy: 'resend'
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    console.log(`✅ [INVITE-${requestId}] Email enviado com sucesso!`, {
      emailId: emailResponse.data?.id,
      to: requestData.email
    });

    // Atualizar estatísticas do convite se possível
    if (supabase && requestData.inviteId) {
      try {
        await supabase.rpc('update_invite_send_attempt', { 
          invite_id: requestData.inviteId 
        });
        console.log(`📊 [INVITE-${requestId}] Estatísticas atualizadas`);
      } catch (statError) {
        console.warn(`⚠️ [INVITE-${requestId}] Erro ao atualizar estatísticas:`, statError);
        // Não falhar por causa disso
      }
    }

    // Retornar sucesso
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de convite enviado com sucesso',
        emailId: emailResponse.data?.id,
        strategy: 'resend',
        method: 'primary'
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )

  } catch (error: any) {
    const requestId = 'unknown';
    console.error(`💥 [INVITE-${requestId}] Erro crítico:`, error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Erro interno do servidor',
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  }
})
