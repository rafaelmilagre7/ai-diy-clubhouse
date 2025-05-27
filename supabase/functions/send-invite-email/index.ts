
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

const createEmailTemplate = (data: InviteEmailRequest) => {
  const expirationDate = new Date(data.expiresAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Convite - Viver de IA</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #0a0a0a;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }
        .logo {
            position: relative;
            z-index: 2;
            font-size: 28px;
            font-weight: 800;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            margin-bottom: 8px;
        }
        .logo-subtitle {
            position: relative;
            z-index: 2;
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 0.5px;
        }
        .content {
            padding: 40px 30px;
            background: #0a0a0a;
        }
        .greeting {
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 20px;
            text-align: center;
        }
        .message {
            font-size: 16px;
            color: #a1a1aa;
            margin-bottom: 30px;
            text-align: center;
            line-height: 1.7;
        }
        .invite-card {
            background: linear-gradient(135deg, #18181b 0%, #27272a 100%);
            border: 1px solid #3f3f46;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            text-align: center;
        }
        .role-badge {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            margin: 20px 0;
        }
        .expiration {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 14px;
            text-align: center;
        }
        .notes {
            background: #1e293b;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
            color: #cbd5e1;
            font-style: italic;
        }
        .footer {
            background: #18181b;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #27272a;
        }
        .footer-text {
            color: #71717a;
            font-size: 14px;
            margin-bottom: 15px;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            color: #3b82f6;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .email-container { margin: 10px; }
            .header, .content, .footer { padding: 20px; }
            .greeting { font-size: 20px; }
            .cta-button { padding: 14px 24px; font-size: 15px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">Viver de IA</div>
            <div class="logo-subtitle">Sua jornada com IA começa aqui</div>
        </div>
        
        <div class="content">
            <h1 class="greeting">Você foi convidado! 🚀</h1>
            <p class="message">
                ${data.senderName ? `${data.senderName} te` : 'Você foi'} convidou para fazer parte da comunidade <strong>Viver de IA</strong>, 
                onde empreendedores descobrem como implementar soluções de Inteligência Artificial 
                em seus negócios de forma prática e eficiente.
            </p>
            
            <div class="invite-card">
                <div class="role-badge">${data.roleName}</div>
                <p style="color: #a1a1aa; margin-bottom: 20px;">
                    Seu convite para acessar a plataforma como <strong>${data.roleName}</strong>
                </p>
                <a href="${data.inviteUrl}" class="cta-button">
                    Aceitar Convite
                </a>
            </div>
            
            ${data.notes ? `
            <div class="notes">
                <strong>Nota do remetente:</strong><br>
                ${data.notes}
            </div>
            ` : ''}
            
            <div class="expiration">
                ⏰ <strong>Importante:</strong> Este convite expira em ${expirationDate}
            </div>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #0f172a; border-radius: 8px;">
                <h3 style="color: #3b82f6; margin-bottom: 15px;">O que você vai encontrar:</h3>
                <ul style="list-style: none; color: #cbd5e1; text-align: left; display: inline-block;">
                    <li style="margin: 8px 0;">✨ Soluções práticas de IA para seu negócio</li>
                    <li style="margin: 8px 0;">🎯 Trilhas personalizadas de implementação</li>
                    <li style="margin: 8px 0;">🤝 Networking com outros empreendedores</li>
                    <li style="margin: 8px 0;">📚 Cursos e materiais exclusivos</li>
                    <li style="margin: 8px 0;">🛠️ Ferramentas e recursos premium</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                Se você não conseguir clicar no botão, copie e cole este link no seu navegador:
            </p>
            <p style="color: #3b82f6; word-break: break-all; font-size: 12px; margin: 10px 0;">
                ${data.inviteUrl}
            </p>
            
            <div class="social-links">
                <a href="https://viverdeia.ai">🌐 Site Oficial</a>
                <a href="mailto:contato@viverdeia.ai">📧 Contato</a>
            </div>
            
            <p style="color: #71717a; font-size: 12px; margin-top: 20px;">
                © 2024 Viver de IA. Transformando negócios com Inteligência Artificial.
            </p>
        </div>
    </div>
</body>
</html>`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: InviteEmailRequest = await req.json();
    
    console.log("📧 Enviando convite para:", data.email);
    
    // Validações robustas
    if (!data.email || !data.inviteUrl || !data.roleName) {
      throw new Error("Dados obrigatórios ausentes");
    }

    const emailSubject = `🚀 Convite para Viver de IA - Papel: ${data.roleName}`;
    const htmlContent = createEmailTemplate(data);

    const emailResponse = await resend.emails.send({
      from: "Viver de IA <convites@viverdeia.ai>",
      to: [data.email],
      subject: emailSubject,
      html: htmlContent,
    });

    console.log("✅ Email enviado com sucesso:", {
      id: emailResponse.data?.id,
      email: data.email,
      role: data.roleName
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email enviado com sucesso",
        emailId: emailResponse.data?.id,
        subject: emailSubject
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ Erro ao enviar email:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Erro ao enviar email de convite",
        error: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
