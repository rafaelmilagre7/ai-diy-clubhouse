
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
  senderName?: string;
  notes?: string;
  inviteId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY não está configurada");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Chave da API de email não configurada" 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const resend = new Resend(resendApiKey);
    
    const { 
      email, 
      inviteUrl, 
      roleName, 
      expiresAt, 
      senderName, 
      notes,
      inviteId 
    }: InviteEmailRequest = await req.json();

    console.log("Enviando convite por email:", { email, inviteUrl, roleName });

    // Validar URL do convite
    const urlPattern = /^https:\/\/app\.viverdeia\.ai\/convite\/[A-Z0-9]+$/i;
    if (!urlPattern.test(inviteUrl)) {
      console.error("URL do convite inválida:", inviteUrl);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "URL do convite inválida" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Formatar data de expiração
    const expirationDate = new Date(expiresAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailResponse = await resend.emails.send({
      from: "Viver de IA <noreply@viverdeia.ai>",
      to: [email],
      subject: `Convite para a plataforma Viver de IA - ${roleName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Convite - Viver de IA</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Viver de IA</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Você foi convidado!</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Olá!</h2>
              
              <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                ${senderName ? `${senderName} convidou você` : 'Você foi convidado'} para participar da plataforma <strong>Viver de IA</strong> como <strong>${roleName}</strong>.
              </p>
              
              ${notes ? `
                <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 0 4px 4px 0;">
                  <p style="margin: 0; color: #666; font-style: italic;">"${notes}"</p>
                </div>
              ` : ''}
              
              <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                Para aceitar o convite e criar sua conta, clique no botão abaixo:
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          text-decoration: none; 
                          padding: 15px 30px; 
                          border-radius: 25px; 
                          font-size: 16px; 
                          font-weight: bold; 
                          display: inline-block; 
                          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                          transition: all 0.3s ease;">
                  Aceitar Convite
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px; text-align: center; margin: 30px 0 20px 0;">
                Ou copie e cole este link no seu navegador:
              </p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; border: 1px solid #e9ecef; margin: 0 0 30px 0;">
                <code style="color: #667eea; word-break: break-all; font-size: 14px;">${inviteUrl}</code>
              </div>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;">
                  ⏰ <strong>Este convite expira em:</strong> ${expirationDate}
                </p>
                
                <p style="color: #999; font-size: 12px; margin: 0; line-height: 1.5;">
                  Se você não solicitou este convite, pode ignorar este email com segurança. 
                  Se tiver dúvidas, entre em contato conosco.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2024 Viver de IA. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email enviado com sucesso",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Erro ao enviar email de convite:", error);
    
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

serve(handler);
