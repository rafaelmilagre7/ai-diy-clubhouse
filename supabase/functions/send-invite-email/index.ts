
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName: string;
  notes?: string;
  inviteId?: string;
  test?: boolean;
  forceResend?: boolean;
  apiKey?: string; // Para teste de configuração
}

const generateEmailTemplate = (
  inviteUrl: string,
  roleName: string,
  expiresAt: string,
  senderName: string,
  notes?: string
) => {
  const expiryDate = new Date(expiresAt).toLocaleDateString('pt-BR');
  
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
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Viver de IA</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Você foi convidado para se juntar à nossa plataforma!</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Olá!</h2>
            <p style="margin-bottom: 20px;">
              <strong>${senderName}</strong> convidou você para se juntar à plataforma Viver de IA como <strong>${roleName}</strong>.
            </p>
            
            ${notes ? `<div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #667eea;">
              <p style="margin: 0; font-style: italic;">"${notes}"</p>
            </div>` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Aceitar Convite
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              Este convite expira em <strong>${expiryDate}</strong>. Se você não conseguir clicar no botão, copie e cole o link abaixo no seu navegador:
            </p>
            <p style="color: #667eea; font-size: 12px; word-break: break-all; text-align: center; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
              ${inviteUrl}
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; font-size: 12px; color: #6c757d;">
              Se você não estava esperando este convite, pode ignorar este email com segurança.
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

  try {
    const body: InviteEmailRequest = await req.json();
    console.log("📧 [EDGE-FUNCTION] Recebendo requisição:", {
      email: body.email,
      test: body.test,
      hasInviteId: !!body.inviteId,
      hasApiKey: !!body.apiKey
    });

    // Se é um teste de configuração
    if (body.test && body.email === 'test@example.com') {
      const apiKey = body.apiKey || Deno.env.get("RESEND_API_KEY");
      console.log("🧪 [EDGE-FUNCTION] Teste de configuração:", { hasApiKey: !!apiKey });
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Teste de configuração",
          config_check: {
            has_resend_key: !!apiKey,
            edge_function_active: true
          }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verificar se é apenas um teste simples
    if (body.test) {
      console.log("🧪 [EDGE-FUNCTION] Teste simples da Edge Function");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Edge Function está ativa e funcionando",
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validar dados obrigatórios
    const { email, inviteUrl, roleName, expiresAt, senderName } = body;
    if (!email || !inviteUrl || !roleName || !expiresAt || !senderName) {
      throw new Error("Dados obrigatórios não fornecidos");
    }

    // Configurar Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("❌ [EDGE-FUNCTION] RESEND_API_KEY não configurada");
      throw new Error("Chave da API Resend não configurada");
    }

    const resend = new Resend(resendApiKey);
    console.log("📧 [EDGE-FUNCTION] Resend configurado, enviando email...");

    // Gerar template do email
    const emailHtml = generateEmailTemplate(inviteUrl, roleName, expiresAt, senderName, body.notes);

    // Enviar email
    const emailResponse = await resend.emails.send({
      from: "Viver de IA <convites@viverdeia.ai>",
      to: [email],
      subject: `Convite para Viver de IA - ${roleName}`,
      html: emailHtml,
      tags: [
        { name: 'type', value: 'invite' },
        { name: 'role', value: roleName },
        { name: 'invite_id', value: body.inviteId || 'unknown' }
      ],
    });

    console.log("✅ [EDGE-FUNCTION] Email enviado com sucesso:", {
      emailId: emailResponse.data?.id,
      to: email,
      inviteId: body.inviteId
    });

    return new Response(
      JSON.stringify({
        success: true,
        email_id: emailResponse.data?.id,
        message: `Email enviado para ${email}`,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ [EDGE-FUNCTION] Erro:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
