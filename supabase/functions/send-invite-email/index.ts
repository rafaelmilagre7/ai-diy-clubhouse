
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-security-level",
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
  console.log(`📧 [SEND-INVITE-EMAIL] Nova requisição: ${req.method} - v3.2 Logo Supabase Storage`);
  
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
    
    // URL da logo no Supabase Storage
    const logoUrl = "https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/logos/email/viver-de-ia-logo.png";
    
    const emailResponse = await resend.emails.send({
      from: "Viver de IA <convites@viverdeia.ai>",
      to: [email],
      subject: isResend ? "🔄 Convite Reenviado - Viver de IA" : "🎉 Convite para Viver de IA",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
          <!-- Header com logo e gradiente da marca -->
          <div style="background: linear-gradient(to right, #22d3ee, #14b8a6); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; box-shadow: 0 4px 20px rgba(34, 211, 238, 0.3);">
            <img src="${logoUrl}" alt="Viver de IA" style="height: 56px; width: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;" />
            <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: bold;">Viver de IA</h1>
            <p style="margin: 0; font-size: 18px; opacity: 0.95;">
              ${isResend ? 'Reenvio do seu' : 'Você recebeu um'} convite para nossa plataforma!
            </p>
          </div>
          
          <!-- Corpo do e-mail -->
          <div style="background: white; padding: 40px 30px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">Olá!</p>
            
            ${isResend ? 
              '<p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">Este é um reenvio do seu convite para acessar a plataforma Viver de IA.</p>' :
              '<p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">Você foi convidado para fazer parte da comunidade Viver de IA - a plataforma de educação e networking em Inteligência Artificial.</p>'
            }
            
            ${notes ? `<div style="background: #f0f9ff; border-left: 4px solid #22d3ee; padding: 16px; margin: 20px 0; border-radius: 8px;">
              <p style="margin: 0; font-size: 16px; color: #374151;"><strong style="color: #0891b2;">Observações:</strong> ${notes}</p>
            </div>` : ''}
            
            <!-- CTA Section -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #ecfeff 100%); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; border: 1px solid #bae6fd;">
              <p style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #0f172a;">Clique no botão abaixo para aceitar o convite:</p>
              <a href="${inviteUrl}" 
                 style="display: inline-block;
                        background: linear-gradient(to right, #22d3ee, #14b8a6); 
                        color: white; 
                        padding: 16px 32px; 
                        text-decoration: none; 
                        border-radius: 12px; 
                        font-weight: 600;
                        font-size: 16px;
                        box-shadow: 0 4px 15px rgba(34, 211, 238, 0.3);
                        transition: all 0.3s ease;">
                ✨ Aceitar Convite
              </a>
            </div>
            
            <div style="border-top: 2px solid #f1f5f9; padding-top: 20px; margin-top: 30px;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Ou copie e cole este link no seu navegador:</p>
              <p style="word-break: break-all; color: #0891b2; font-size: 14px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; font-family: monospace;">
                ${inviteUrl}
              </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="font-size: 12px; color: #9ca3af; line-height: 1.5; margin: 0;">
              Este convite é pessoal e intransferível. Se você não solicitou este convite, pode ignorar este email.
            </p>
          </div>
          
          <!-- Footer atualizado com ano correto -->
          <div style="background: #1f2937; color: #d1d5db; padding: 25px; text-align: center; border-radius: 0 0 12px 12px; border-top: 3px solid #22d3ee;">
            <p style="margin: 0; font-size: 12px;">
              © 2025 Viver de IA - Plataforma de Inteligência Artificial
            </p>
            <p style="margin: 8px 0 0 0; font-size: 11px; opacity: 0.8;">
              A maior comunidade brasileira de IA aplicada
            </p>
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

console.log("📧 [SEND-INVITE-EMAIL] Edge Function carregada! v3.2 Logo Supabase Storage");
serve(handler);
