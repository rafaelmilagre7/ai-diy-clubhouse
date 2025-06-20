
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: TestEmailRequest = await req.json();

    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error('API key do Resend não configurada');
    }

    const resend = new Resend(apiKey);

    const emailResponse = await resend.emails.send({
      from: "Diagnóstico <diagnostico@viverdeia.ai>",
      to: [email],
      subject: "🔧 Teste de Diagnóstico - Viver de IA",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Teste de Diagnóstico</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">✅ Teste Realizado com Sucesso</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Sistema de Email - Viver de IA</p>
              </div>
              
              <div style="padding: 30px 20px;">
                <h2 style="color: #333; margin-top: 0;">🎉 Sistema Funcionando Perfeitamente!</h2>
                <p>Este email confirma que o sistema de envio de emails da plataforma Viver de IA está operacional e funcionando corretamente.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #495057;">📊 Detalhes do Teste:</h3>
                  <ul style="margin-bottom: 0;">
                    <li><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</li>
                    <li><strong>Email de Destino:</strong> ${email}</li>
                    <li><strong>Provedor:</strong> Resend</li>
                    <li><strong>Domínio:</strong> viverdeia.ai</li>
                  </ul>
                </div>
                
                <p style="color: #6c757d; font-size: 14px; margin-bottom: 0;">
                  Este é um email automático de teste do sistema de diagnósticos. 
                  Se você recebeu este email, significa que tudo está funcionando corretamente! 🚀
                </p>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                <p style="margin: 0; font-size: 12px; color: #6c757d;">
                  Viver de IA - Plataforma de Automação e Inteligência Artificial
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email de teste enviado:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        message: "Email de teste enviado com sucesso",
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Erro no envio do email de teste:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
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
