
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as smtp from "npm:nodemailer@6.9.10";
import { corsHeaders } from "../_shared/cors.ts";

interface InviteEmailRequest {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string; // ID do convite para atualizar estatísticas
}

// Obter configurações SMTP do ambiente
const smtpConfig = {
  host: Deno.env.get("SMTP_HOST") || "smtp.hostinger.com",
  port: parseInt(Deno.env.get("SMTP_PORT") || "465"),
  secure: true, // true para porta 465 (SSL), false para outras portas
  auth: {
    user: Deno.env.get("SMTP_USER"),
    pass: Deno.env.get("SMTP_PASS")
  }
};

serve(async (req) => {
  // Lidar com requisições preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Iniciando função send-invite-email");
    console.log("Configuração SMTP:", {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      authUser: smtpConfig.auth.user ? "Configurado" : "Não configurado",
      authPass: smtpConfig.auth.pass ? "Configurado" : "Não configurado"
    });
    
    const { email, inviteUrl, roleName, expiresAt, senderName, notes, inviteId } = await req.json() as InviteEmailRequest;

    // Verificar se temos todas as informações necessárias
    if (!email || !inviteUrl || !roleName || !expiresAt) {
      console.error("Dados incompletos:", { email, inviteUrl, roleName, expiresAt });
      throw new Error("Dados de convite incompletos");
    }

    // Verificar se temos as credenciais SMTP
    if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
      console.error("Credenciais SMTP não configuradas");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Credenciais SMTP não configuradas",
          message: "As credenciais do servidor de e-mail não estão configuradas."
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Formatar a data de expiração
    const expireDate = new Date(expiresAt);
    const formattedExpireDate = expireDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Extrair token do URL para exibição separada
    let token = "";
    let cleanUrl = inviteUrl;
    try {
      const url = new URL(inviteUrl);
      // Certificar-se de que a URL não contenha caracteres problemáticos
      token = url.pathname.split('/').pop() || "";
      
      // Limpar qualquer espaço em branco na URL
      cleanUrl = url.toString().trim();
      
      console.log("Token extraído do URL:", token, "comprimento:", token.length);
      console.log("URL limpa:", cleanUrl);
    } catch (e) {
      console.error("Erro ao extrair token do URL:", e);
    }

    // Criar transportador SMTP
    const transporter = smtp.createTransport(smtpConfig);

    // Obter o email do remetente das variáveis de ambiente ou usar o padrão
    const senderEmail = Deno.env.get("SMTP_USER") || "no-reply@viverdeia.ai";
    const senderDomain = senderEmail.split('@')[1];

    // Configurar email com layout melhorado para garantir que os links não quebrem
    const mailOptions = {
      from: `"VIVER DE IA Club" <${senderEmail}>`,
      to: email,
      subject: "Convite para o VIVER DE IA Club",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Convite para o VIVER DE IA Club</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header img {
              max-width: 200px;
            }
            .button {
              display: inline-block;
              background-color: #4361ee;
              color: white !important;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
              white-space: nowrap;
            }
            .footer {
              margin-top: 40px;
              font-size: 12px;
              color: #666;
            }
            .note {
              background-color: #f8f9fa;
              border-left: 4px solid #4361ee;
              padding: 15px;
              margin: 20px 0;
            }
            .token-display {
              font-family: monospace;
              font-size: 18px;
              background-color: #f0f0f0;
              border: 1px solid #ddd;
              padding: 10px;
              border-radius: 4px;
              margin: 10px 0;
              text-align: center;
              letter-spacing: 2px;
              font-weight: bold;
            }
            .url-container {
              word-break: break-all;
              background-color: #f5f5f5;
              padding: 10px;
              border-radius: 4px;
              margin: 15px 0;
              border: 1px solid #eee;
            }
            .important-note {
              color: #d32f2f;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Você foi convidado para o VIVER DE IA Club!</h1>
          </div>
          
          <p>Olá,</p>
          
          <p>Você recebeu um convite para participar do VIVER DE IA Club com o papel de <strong>${roleName}</strong>.</p>
          
          ${notes ? `<div class="note"><p><strong>Mensagem do convidante:</strong></p><p>${notes}</p></div>` : ''}
          
          <p>Para aceitar o convite, clique no botão abaixo:</p>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center">
                <a href="${cleanUrl}" class="button" style="color: white !important; text-decoration: none !important;">Aceitar Convite</a>
              </td>
            </tr>
          </table>
          
          <p><strong>Importante:</strong> Este convite expira em ${formattedExpireDate}.</p>
          
          <p>Se o botão acima não funcionar, você pode copiar e colar o link a seguir no seu navegador:</p>
          <div class="url-container">
            <a href="${cleanUrl}" style="color: #4361ee;">${cleanUrl}</a>
          </div>
          
          <p class="important-note">⚠️ ATENÇÃO: Se tiver problemas com o link acima, use este código de convite:</p>
          <div class="token-display">${token}</div>
          <p>Entre em <strong>viverdeia.ai/convite</strong> e cole o código acima</p>
          
          ${senderName ? `<p>Convite enviado por: ${senderName}</p>` : ''}
          
          <div class="footer">
            <p>Se você recebeu este e-mail por engano, pode ignorá-lo com segurança.</p>
            <p>&copy; ${new Date().getFullYear()} VIVER DE IA Club. Todos os direitos reservados.</p>
          </div>
        </body>
        </html>
      `
    };

    // Enviar email
    console.log("Tentando enviar e-mail para:", email);
    try {
      const result = await transporter.sendMail(mailOptions);
      console.log("E-mail enviado com sucesso:", result);

      // Se um ID de convite foi fornecido, atualizar as estatísticas de envio
      if (inviteId) {
        try {
          // Atualizar as estatísticas do convite usando a função RPC
          const { data: updateData, error: updateError } = await fetch(
            `${Deno.env.get("SUPABASE_URL")}/rest/v1/rpc/update_invite_send_attempt`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
              },
              body: JSON.stringify({ invite_id: inviteId })
            }
          ).then(res => res.json());

          if (updateError) {
            console.error("Erro ao atualizar estatísticas de envio:", updateError);
          }
        } catch (updateErr) {
          console.error("Falha ao atualizar estatísticas de envio:", updateErr);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            messageId: result.messageId,
            accepted: result.accepted
          },
          message: `Convite enviado para ${email} com sucesso.`
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (emailError) {
      console.error("Erro ao enviar e-mail:", emailError);
      return new Response(
        JSON.stringify({
          success: false,
          error: emailError.message,
          code: emailError.code || "UNKNOWN",
          command: emailError.command || "",
          message: `Falha ao enviar e-mail para ${email}: ${emailError.message}`
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("Erro na função send-invite-email:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: "Falha ao enviar o convite por e-mail."
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
