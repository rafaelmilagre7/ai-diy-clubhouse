
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface InviteEmailRequest {
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
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { inviteId, email, token, isResend = false, notes }: InviteEmailRequest = await req.json();
    
    console.log(`📨 [SEND-INVITE-EMAIL] Enviando para: ${email}, Token: ${token}, Reenvio: ${isResend}`);

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY não configurada");
    }

    const resend = new Resend(apiKey);
    
    const inviteUrl = `${Deno.env.get("SITE_URL") || "https://viverdeia.ai"}/convite/${token}`;
    
    // Template de e-mail melhorado
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">🎉 Viver de IA</div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 600;">
            ${isResend ? '🔄 Reenvio do Convite' : 'Você foi convidado!'}
          </h1>
          <p style="margin: 15px 0 0 0; font-size: 16px; opacity: 0.9;">
            ${isResend ? 
              'Este é um reenvio do seu convite para nossa plataforma' : 
              'Junte-se à maior comunidade de IA do Brasil'
            }
          </p>
        </div>
        
        <!-- Content -->
        <div style="background: white; padding: 40px 30px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; font-size: 20px; margin-bottom: 15px;">
              ${isResend ? 'Seu convite ainda está válido!' : 'Bem-vindo à revolução da IA!'}
            </h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
              ${isResend ? 
                'Reenvimos seu convite para acessar a plataforma Viver de IA. Clique no botão abaixo para começar.' :
                'Você foi convidado para fazer parte da comunidade Viver de IA - a plataforma mais completa de educação e networking em Inteligência Artificial do Brasil.'
              }
            </p>
            
            ${notes ? `
              <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; text-align: left;">
                <p style="margin: 0; color: #333; font-style: italic;">
                  <strong>📝 Observação:</strong><br>
                  ${notes}
                </p>
              </div>
            ` : ''}
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; 
                      font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                      transition: transform 0.2s ease;">
              🚀 Aceitar Convite
            </a>
          </div>
          
          <!-- Alternative Link -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-align: center;">
              Ou copie e cole este link no seu navegador:
            </p>
            <p style="margin: 0; word-break: break-all; color: #667eea; font-size: 13px; text-align: center; font-family: monospace;">
              ${inviteUrl}
            </p>
          </div>
          
          <!-- Features -->
          <div style="margin: 30px 0;">
            <h3 style="color: #333; font-size: 18px; margin-bottom: 20px; text-align: center;">
              O que você vai encontrar:
            </h3>
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                <span style="font-size: 20px; margin-right: 15px;">🎓</span>
                <div>
                  <strong style="color: #333;">Formação Completa</strong>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Cursos e trilhas de aprendizado em IA</p>
                </div>
              </div>
              <div style="display: flex; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                <span style="font-size: 20px; margin-right: 15px;">🛠️</span>
                <div>
                  <strong style="color: #333;">Ferramentas Práticas</strong>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Soluções prontas para implementar</p>
                </div>
              </div>
              <div style="display: flex; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                <span style="font-size: 20px; margin-right: 15px;">👥</span>
                <div>
                  <strong style="color: #333;">Comunidade Ativa</strong>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Networking com profissionais e experts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="margin: 0 0 10px 0; font-size: 12px; color: #666;">
            Este convite é pessoal e intransferível. Se você não solicitou este convite, pode ignorar este email.
          </p>
          <p style="margin: 0; font-size: 12px; color: #999;">
            © 2024 Viver de IA - Transformando negócios com Inteligência Artificial
          </p>
          <p style="margin: 10px 0 0 0; font-size: 11px; color: #999;">
            ID do Convite: ${inviteId}
          </p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Viver de IA <convites@viverdeia.ai>",
      to: [email],
      subject: isResend ? "🔄 Reenvio do Convite - Viver de IA | Sua vaga ainda está disponível!" : "🎉 Convite Especial - Viver de IA | Transforme seu futuro com IA",
      html: emailHtml,
      headers: {
        'X-Invite-ID': inviteId,
        'X-Invite-Type': isResend ? 'resend' : 'new'
      }
    });

    console.log(`✅ [SEND-INVITE-EMAIL] Email enviado com sucesso:`, emailResponse.data?.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email de convite enviado com sucesso",
        emailId: emailResponse.data?.id,
        email,
        inviteId,
        sentAt: new Date().toISOString()
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
        error: error.message || "Erro interno do servidor",
        message: "Falha ao enviar email de convite"
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
