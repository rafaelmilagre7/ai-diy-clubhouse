
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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

const getEmailTemplate = (token: string, isResend: boolean = false, notes?: string) => {
  const inviteUrl = `${Deno.env.get("SITE_URL") || "https://viverdeia.ai"}/convite/${token}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isResend ? 'Reenvio de ' : ''}Convite - Viver de IA</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            line-height: 1.6;
            color: #334155;
            background-color: #f8fafc;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(1deg); }
          }
          
          .logo {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 8px 0;
            position: relative;
            z-index: 2;
          }
          
          .header-subtitle {
            color: rgba(255,255,255,0.9);
            font-size: 16px;
            margin: 0;
            position: relative;
            z-index: 2;
          }
          
          .status-badge {
            display: inline-block;
            background-color: ${isResend ? '#f59e0b' : '#10b981'};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 20px 0 0 0;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 16px 0;
          }
          
          .description {
            font-size: 16px;
            color: #64748b;
            margin: 0 0 30px 0;
            line-height: 1.7;
          }
          
          .invite-card {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
            border: 1px solid #e2e8f0;
          }
          
          .invite-text {
            font-size: 14px;
            color: #64748b;
            margin: 0 0 20px 0;
            font-weight: 500;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px 0 rgba(102, 126, 234, 0.6);
          }
          
          .token-info {
            background-color: #f1f5f9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
          }
          
          .token-label {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 8px 0;
          }
          
          .token-value {
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 16px;
            color: #1e293b;
            font-weight: 600;
            word-break: break-all;
          }
          
          .notes-section {
            background-color: #fef3c7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
          }
          
          .notes-title {
            font-size: 14px;
            color: #92400e;
            font-weight: 600;
            margin: 0 0 8px 0;
          }
          
          .notes-content {
            font-size: 14px;
            color: #78350f;
            margin: 0;
          }
          
          .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer-text {
            font-size: 12px;
            color: #64748b;
            margin: 0 0 16px 0;
            line-height: 1.5;
          }
          
          .company-info {
            font-size: 12px;
            color: #94a3b8;
            margin: 0;
          }
          
          .mobile-responsive {
            display: block;
          }
          
          @media only screen and (max-width: 600px) {
            .container {
              margin: 0;
              border-radius: 0;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .invite-card {
              padding: 20px;
              margin: 20px 0;
            }
            
            .cta-button {
              padding: 14px 24px;
              font-size: 15px;
              width: 100%;
              box-sizing: border-box;
            }
            
            .footer {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1 class="logo">Viver de IA</h1>
            <p class="header-subtitle">Plataforma de Inteligência Artificial</p>
            <div class="status-badge">
              ${isResend ? '🔄 Convite Reenviado' : '🎉 Novo Convite'}
            </div>
          </div>
          
          <!-- Content -->
          <div class="content">
            <h2 class="greeting">
              ${isResend ? 'Reenvio do seu convite!' : 'Você foi convidado!'}
            </h2>
            
            <p class="description">
              ${isResend 
                ? 'Este é um reenvio do seu convite para acessar a plataforma Viver de IA. Caso você não tenha recebido o convite anterior ou ele tenha expirado, use este link para se juntar à nossa comunidade.'
                : 'Você recebeu um convite especial para fazer parte da comunidade Viver de IA - a plataforma de educação e networking em Inteligência Artificial mais completa do Brasil.'
              }
            </p>
            
            <div class="invite-card">
              <p class="invite-text">
                Clique no botão abaixo para aceitar seu convite:
              </p>
              <a href="${inviteUrl}" class="cta-button">
                ✨ Aceitar Convite
              </a>
            </div>
            
            <div class="token-info">
              <div class="token-label">Código do Convite</div>
              <div class="token-value">${token}</div>
            </div>
            
            ${notes ? `
              <div class="notes-section">
                <div class="notes-title">📝 Observações do Administrador</div>
                <p class="notes-content">${notes}</p>
              </div>
            ` : ''}
            
            <p style="font-size: 14px; color: #64748b; margin: 30px 0 0 0;">
              <strong>Ou copie e cole este link no seu navegador:</strong><br>
              <span style="word-break: break-all; color: #667eea; font-family: monospace;">${inviteUrl}</span>
            </p>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p class="footer-text">
              Este convite é pessoal e intransferível. Se você não solicitou este convite, pode ignorar este email com segurança.
            </p>
            <p class="company-info">
              © 2024 Viver de IA - Transformando negócios com Inteligência Artificial
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

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
    const { inviteId, email, roleId, token, isResend = false, notes }: InviteEmailRequest = await req.json();
    
    console.log(`📨 [SEND-INVITE-EMAIL] Enviando para: ${email}, Token: ${token}, Reenvio: ${isResend}`);

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY não configurada");
    }

    const resend = new Resend(apiKey);
    
    const emailHtml = getEmailTemplate(token, isResend, notes);
    
    const emailResponse = await resend.emails.send({
      from: "Viver de IA <convites@viverdeia.ai>",
      to: [email],
      subject: isResend 
        ? "🔄 Reenvio do Convite - Viver de IA" 
        : "🎉 Seu Convite para Viver de IA Chegou!",
      html: emailHtml,
      tags: [
        { name: 'type', value: 'invite' },
        { name: 'invite_id', value: inviteId },
        { name: 'is_resend', value: isResend.toString() },
        { name: 'role_id', value: roleId },
      ],
    });

    console.log(`✅ [SEND-INVITE-EMAIL] Email enviado com sucesso:`, emailResponse.data?.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email de convite enviado com sucesso",
        emailId: emailResponse.data?.id,
        inviteId
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
