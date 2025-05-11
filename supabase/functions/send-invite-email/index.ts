
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Inicializar o cliente Resend com a chave API
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Configurar headers CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
}

serve(async (req) => {
  // Lidar com requisições preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, inviteUrl, roleName, expiresAt, senderName, notes } = await req.json() as InviteEmailRequest;

    // Formatar a data de expiração
    const expireDate = new Date(expiresAt);
    const formattedExpireDate = expireDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Criar e enviar o email
    const { data, error } = await resend.emails.send({
      from: "Viver de IA Club <noreply@viverdeia.ai>",
      to: [email],
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
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
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
          
          <div style="text-align: center;">
            <a href="${inviteUrl}" class="button">Aceitar Convite</a>
          </div>
          
          <p><strong>Importante:</strong> Este convite expira em ${formattedExpireDate}.</p>
          
          <p>Se o botão acima não funcionar, você pode copiar e colar o link a seguir no seu navegador:</p>
          <p style="word-break: break-all;">${inviteUrl}</p>
          
          ${senderName ? `<p>Convite enviado por: ${senderName}</p>` : ''}
          
          <div class="footer">
            <p>Se você recebeu este e-mail por engano, pode ignorá-lo com segurança.</p>
            <p>&copy; ${new Date().getFullYear()} VIVER DE IA Club. Todos os direitos reservados.</p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Erro ao enviar e-mail:", error);
      throw error;
    }

    console.log("E-mail de convite enviado com sucesso:", data);

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
        message: `Convite enviado para ${email} com sucesso.`
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
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
