
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SendInviteEmailRequest {
  inviteId: string;
  email: string;
  roleId: string;
  token: string;
  isResend?: boolean;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log(`📧 [SEND-INVITE-EMAIL] Nova requisição: ${req.method}`);
  
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
    const { inviteId, email, roleId, token, isResend = false, notes }: SendInviteEmailRequest = await req.json();
    
    console.log(`📨 [SEND-INVITE-EMAIL] Enviando para: ${email}, Token: ${token}, Reenvio: ${isResend}`);

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY não configurada");
    }

    const resend = new Resend(apiKey);
    
    const inviteUrl = `${Deno.env.get("SITE_URL") || "https://viverdeia.ai"}/convite/${token}`;
    
    const emailResponse = await resend.emails.send({
      from: "Viver de IA <convites@viverdeia.ai>",
      to: [email],
      subject: isResend ? "🔄 Convite Reenviado - Viver de IA" : "🎉 Convite para Viver de IA",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>Viver de IA</h1>
            <p>${isResend ? 'Reenvio do seu' : 'Você recebeu um'} convite para nossa plataforma!</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0;">
            <p>Olá!</p>
            
            ${isResend ? 
              '<p>Este é um reenvio do seu convite para acessar a plataforma Viver de IA.</p>' :
              '<p>Você foi convidado para fazer parte da comunidade Viver de IA - a plataforma de educação e networking em Inteligência Artificial.</p>'
            }
            
            ${notes ? `<p><strong>Observações:</strong> ${notes}</p>` : ''}
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0 0 15px 0; font-weight: bold;">Clique no botão abaixo para aceitar o convite:</p>
              <a href="${inviteUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold;
                        display: inline-block;">
                Aceitar Convite
              </a>
            </div>
            
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #667eea; font-size: 14px;">${inviteUrl}</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
            
            <p style="font-size: 12px; color: #666;">
              Este convite é pessoal e intransferível. Se você não solicitou este convite, pode ignorar este email.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
            <p>© 2024 Viver de IA - Plataforma de Inteligência Artificial</p>
          </div>
        </div>
      `,
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

console.log("📧 [SEND-INVITE-EMAIL] Edge Function carregada!");
serve(handler);
