import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SendInviteRequest {
  email: string;
  token: string;
  roleId: string;
  isResend?: boolean;
  userName?: string;
}

// Template compatível com Outlook/Hotmail usando tabelas
const getOutlookCompatibleTemplate = (inviteUrl: string, userName?: string, isResend?: boolean) => {
  const currentYear = new Date().getFullYear();
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite - Viver de IA</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #667eea; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Viver de IA</h1>
              <p style="color: #ffffff; margin: 15px 0 0 0; font-size: 16px; opacity: 0.9;">
                ${isResend ? 'Reenvio do seu convite' : 'Você foi convidado para nossa plataforma!'}
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${userName ? `<p style="margin: 0 0 20px 0; font-size: 16px; color: #333333;">Olá, ${userName}!</p>` : '<p style="margin: 0 0 20px 0; font-size: 16px; color: #333333;">Olá!</p>'}
              
              ${isResend ? 
                '<p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.5;">Este é um reenvio do seu convite para acessar a plataforma Viver de IA.</p>' :
                '<p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.5;">Você foi convidado para fazer parte da comunidade Viver de IA - a plataforma de educação e networking em Inteligência Artificial.</p>'
              }
              
              <!-- CTA Section -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td style="background-color: #f8f9fa; padding: 25px; text-align: center; border-radius: 8px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: bold; color: #333333;">Clique no botão abaixo para aceitar o convite:</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="background-color: #667eea; border-radius: 6px;">
                          <a href="${inviteUrl}" style="display: block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                            Aceitar Convite
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; font-size: 14px; color: #666666;">
                Ou copie e cole este link no seu navegador:
              </p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #667eea; word-break: break-all;">
                ${inviteUrl}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #666666;">
                Este convite é pessoal e intransferível. Se você não solicitou este convite, pode ignorar este email.
              </p>
              <p style="margin: 0; font-size: 12px; color: #666666;">
                © ${currentYear} Viver de IA - Plataforma de Inteligência Artificial
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const handler = async (req: Request): Promise<Response> => {
  console.log(`📧 [SEND-INVITE-EMAIL] Nova requisição: ${req.method} - v3-6 Data Corrigida`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido" }), 
      { 
        status: 405, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }

  try {
    const { email, token, isResend = false, userName }: SendInviteRequest = await req.json();
    
    console.log(`📨 [SEND-INVITE-EMAIL] Enviando para: ${email}, Token: ${token}, Reenvio: ${isResend}`);

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY não configurada");
    }

    const resend = new Resend(apiKey);
    
    const inviteUrl = `${Deno.env.get("SITE_URL") || "https://app.viverdeia.ai"}/convite/${token}`;
    console.log(`📧 [SEND-INVITE-EMAIL] URL do convite: ${inviteUrl}`);
    
    const emailHtml = getOutlookCompatibleTemplate(inviteUrl, userName, isResend);
    
    const emailResponse = await resend.emails.send({
      from: "Viver de IA <convites@viverdeia.ai>",
      to: [email],
      subject: isResend ? "🔄 Convite Reenviado - Viver de IA" : "🎉 Convite para Viver de IA",
      html: emailHtml,
      tags: [
        { name: 'type', value: 'invite' },
        { name: 'version', value: 'v3-6-data-corrigida' },
        { name: 'is_resend', value: isResend.toString() }
      ]
    });

    console.log(`✅ [SEND-INVITE-EMAIL] Email enviado com sucesso:`, emailResponse.data?.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email de convite enviado com sucesso",
        emailId: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`❌ [SEND-INVITE-EMAIL] Erro:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno do servidor"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("📧 [SEND-INVITE-EMAIL] Edge Function carregada! v3-6 Data Corrigida");
serve(handler);
