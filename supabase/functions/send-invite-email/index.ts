
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { format } from "https://deno.land/std@0.168.0/datetime/mod.ts";
import nodemailer from "https://esm.sh/nodemailer@6.9.9";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string;
  userType?: 'new_user' | 'existing_user';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      inviteUrl, 
      roleName, 
      expiresAt, 
      senderName, 
      notes,
      inviteId, 
      userType = 'existing_user' 
    } = await req.json() as EmailRequest;

    // Validar parâmetros essenciais
    if (!email || !inviteUrl || !roleName) {
      throw new Error("Parâmetros obrigatórios ausentes");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        global: { fetch: fetch.bind(globalThis) },
        auth: { persistSession: false }
      }
    );

    // Formatar data de expiração
    let formattedExpiresAt = '';
    try {
      const expiresAtDate = new Date(expiresAt);
      formattedExpiresAt = format(expiresAtDate, "dd/MM/yyyy 'às' HH:mm");
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      formattedExpiresAt = "desconhecido";
    }

    // Definir mensagem específica com base no tipo de usuário
    let titleMessage, actionMessage;
    if (userType === 'new_user') {
      titleMessage = `Você foi convidado para o VIVER DE IA Club como ${roleName}`;
      actionMessage = "Criar sua conta";
    } else {
      titleMessage = `Seu acesso ao VIVER DE IA Club foi atualizado para ${roleName}`;
      actionMessage = "Acessar plataforma";
    }

    // Construir template HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${titleMessage}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
            margin-bottom: 20px;
          }
          .content {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 20px;
          }
          .footer {
            font-size: 12px;
            color: #666;
            text-align: center;
            margin-top: 30px;
          }
          .button {
            display: inline-block;
            background-color: #0ABAB5;
            color: white;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
          }
          .token {
            background-color: #eee;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 18px;
            text-align: center;
            letter-spacing: 2px;
            margin: 20px 0;
          }
          .expires {
            font-size: 14px;
            color: #666;
            text-align: center;
          }
          .notes {
            background-color: #fff;
            border-left: 4px solid #0ABAB5;
            padding: 10px 15px;
            margin: 20px 0;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://milagredigital.com/wp-content/uploads/2024/04/viverdeia-logo-email.png" alt="VIVER DE IA Club">
          <h1>${titleMessage}</h1>
        </div>
        
        <div class="content">
          <p>Olá,</p>
          
          ${userType === 'new_user' ? `
            <p>Você foi convidado para participar do <strong>VIVER DE IA Club</strong> como <strong>${roleName}</strong>. 
            Para acessar a plataforma, você precisará criar sua conta utilizando este email.</p>
          ` : `
            <p>Seu acesso ao <strong>VIVER DE IA Club</strong> foi atualizado para <strong>${roleName}</strong>. 
            Você pode acessar a plataforma com suas credenciais existentes.</p>
          `}
          
          ${senderName ? `<p>Convite enviado por: <strong>${senderName}</strong></p>` : ''}
          
          ${notes ? `<div class="notes">${notes}</div>` : ''}
          
          <p>Use o link abaixo para acessar a plataforma:</p>
          <div style="text-align: center;">
            <a href="${inviteUrl}" class="button">${actionMessage}</a>
          </div>
          
          <p>Alternativamente, você pode inserir o seguinte código de convite na plataforma:</p>
          <div class="token">${inviteUrl.split('/').pop()}</div>
          
          <p class="expires">Este convite expira em: ${formattedExpiresAt}</p>
        </div>
        
        <div class="footer">
          <p>Este é um email automático, por favor não responda.</p>
          <p>&copy; ${new Date().getFullYear()} VIVER DE IA Club. Todos os direitos reservados.</p>
        </div>
      </body>
      </html>
    `;

    // Configuração do transporte SMTP usando Nodemailer
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = Deno.env.get("SMTP_PORT");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      throw new Error("Configurações SMTP incompletas. Verifique as variáveis de ambiente.");
    }
    
    console.log("Configurando SMTP com host:", smtpHost);
    
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465, // true para porta 465, false para outras portas
      auth: {
        user: smtpUser,
        pass: smtpPass,
      }
    });
    
    // Enviar email usando Nodemailer
    const mailOptions = {
      from: `"VIVER DE IA Club" <${smtpUser}>`,
      to: email,
      subject: titleMessage,
      html: htmlContent,
    };
    
    console.log("Enviando email para:", email);
    
    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado:", info);

    // Registrar tentativa de envio no banco de dados
    if (inviteId) {
      try {
        // Atualizar registro de tentativas
        await supabase.rpc('update_invite_send_attempt', { invite_id: inviteId });
      } catch (dbError) {
        console.error("Erro ao atualizar registro de tentativa:", dbError);
        // Não falhar completamente se apenas o registro de tentativa falhar
      }
    }

    // Retornar resultado
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email enviado com sucesso",
        id: info.messageId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erro ao processar solicitação:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro desconhecido",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
