
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
    console.log("📧 [TEST-EMAIL] Iniciando envio de email de teste...");
    
    const { email }: TestEmailRequest = await req.json();

    // Validação básica do email
    if (!email || !email.includes('@')) {
      console.error("❌ [TEST-EMAIL] Email inválido fornecido:", email);
      throw new Error('Email inválido');
    }

    // Validação mais robusta do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("❌ [TEST-EMAIL] Formato de email inválido:", email);
      throw new Error('Formato de email inválido');
    }

    console.log("✅ [TEST-EMAIL] Email válido:", email);

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("❌ [TEST-EMAIL] API key do Resend não configurada");
      throw new Error('API key do Resend não configurada');
    }

    console.log("🔑 [TEST-EMAIL] API key encontrada, inicializando Resend...");

    let resend;
    try {
      resend = new Resend(apiKey);
    } catch (initError) {
      console.error("❌ [TEST-EMAIL] Erro ao inicializar Resend:", initError);
      throw new Error('Erro na inicialização do Resend');
    }

    console.log("📤 [TEST-EMAIL] Enviando email para:", email);

    const emailResponse = await resend.emails.send({
      from: "Diagnóstico <diagnostico@viverdeia.ai>",
      to: [email],
      subject: "🔧 Teste de Diagnóstico - Sistema Corrigido",
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
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">✅ Sistema Corrigido com Sucesso!</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Diagnóstico de Email - Viver de IA</p>
              </div>
              
              <div style="padding: 30px 20px;">
                <h2 style="color: #333; margin-top: 0;">🎉 Todas as Correções Implementadas!</h2>
                <p>Este email confirma que todas as correções foram aplicadas com sucesso no sistema de email da plataforma Viver de IA.</p>
                
                <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #065f46;">📋 Correções Implementadas:</h3>
                  <ul style="margin-bottom: 0; color: #047857;">
                    <li><strong>✅ Validação robusta da API key</strong></li>
                    <li><strong>✅ Verificação de domínio aprimorada</strong></li>
                    <li><strong>✅ Logs detalhados para debugging</strong></li>
                    <li><strong>✅ Tratamento de erros melhorado</strong></li>
                    <li><strong>✅ Timeouts e fallbacks implementados</strong></li>
                    <li><strong>✅ Interface administrativa aprimorada</strong></li>
                  </ul>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #495057;">📊 Detalhes do Teste:</h3>
                  <ul style="margin-bottom: 0;">
                    <li><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</li>
                    <li><strong>Email de Destino:</strong> ${email}</li>
                    <li><strong>Provedor:</strong> Resend (Corrigido)</li>
                    <li><strong>Domínio:</strong> viverdeia.ai</li>
                    <li><strong>Status:</strong> Sistema Operacional</li>
                  </ul>
                </div>
                
                <p style="color: #6c757d; font-size: 14px; margin-bottom: 0;">
                  Este email confirma que o sistema de diagnósticos foi corrigido e está funcionando perfeitamente! 
                  Todas as melhorias foram implementadas com sucesso. 🚀
                </p>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                <p style="margin: 0; font-size: 12px; color: #6c757d;">
                  Viver de IA - Plataforma de Automação e Inteligência Artificial
                </p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #10b981; font-weight: bold;">
                  ✅ Sistema de Email Totalmente Operacional
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("✅ [TEST-EMAIL] Email enviado com sucesso:", {
      id: emailResponse.data?.id,
      to: email
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        message: "Email de teste enviado com sucesso",
        timestamp: new Date().toISOString(),
        recipient: email
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ [TEST-EMAIL] Erro no envio:", error);
    
    // Categorizar os erros para melhor feedback
    let errorCategory = "unknown";
    let userMessage = error.message;
    
    if (error.message?.includes('API key')) {
      errorCategory = "api_key";
      userMessage = "Problema com a API key do Resend";
    } else if (error.message?.includes('domain')) {
      errorCategory = "domain";
      userMessage = "Problema com o domínio de envio";
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      errorCategory = "quota";
      userMessage = "Limite de envio atingido";
    } else if (error.message?.includes('email') && error.message?.includes('invalid')) {
      errorCategory = "email_format";
      userMessage = "Formato de email inválido";
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: userMessage,
        category: errorCategory,
        timestamp: new Date().toISOString(),
        details: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
