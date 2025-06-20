
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface TestRequest {
  email?: string;
  testType: 'connectivity' | 'domain' | 'send_test';
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🧪 [TEST-${requestId}] Iniciando teste direto do Resend`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { email, testType }: TestRequest = await req.json().catch(() => ({ testType: 'connectivity' }));
    
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error(`❌ [TEST-${requestId}] RESEND_API_KEY não encontrada`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "RESEND_API_KEY não configurada",
          solution: "Configure RESEND_API_KEY nos secrets do Supabase",
          requestId
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`🔑 [TEST-${requestId}] API Key encontrada, iniciando testes...`);
    const resend = new Resend(apiKey);

    // Teste 1: Conectividade básica
    if (testType === 'connectivity') {
      console.log(`🔗 [TEST-${requestId}] Testando conectividade...`);
      
      try {
        const domainsResponse = await resend.domains.list();
        const responseTime = Date.now() - startTime;
        
        console.log(`✅ [TEST-${requestId}] Conectividade OK (${responseTime}ms)`);
        
        return new Response(
          JSON.stringify({
            success: true,
            message: "Conectividade com Resend funcionando",
            responseTime,
            domains: domainsResponse.data?.length || 0,
            requestId
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      } catch (error: any) {
        console.error(`❌ [TEST-${requestId}] Erro de conectividade:`, error);
        
        return new Response(
          JSON.stringify({
            success: false,
            error: `Erro de conectividade: ${error.message}`,
            solution: "Verifique se a RESEND_API_KEY está correta",
            requestId
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    // Teste 2: Validação de domínio
    if (testType === 'domain') {
      console.log(`🌐 [TEST-${requestId}] Testando domínios...`);
      
      try {
        const domainsResponse = await resend.domains.list();
        const domains = domainsResponse.data || [];
        
        const viverdeiaDomain = domains.find(d => d.name === 'viverdeia.ai');
        const responseTime = Date.now() - startTime;
        
        console.log(`📊 [TEST-${requestId}] Domínios encontrados:`, domains.map(d => ({ name: d.name, status: d.status })));
        
        return new Response(
          JSON.stringify({
            success: true,
            message: `${domains.length} domínios encontrados`,
            responseTime,
            domains: domains.map(d => ({ name: d.name, status: d.status })),
            viverdeiaDomain: viverdeiaDomain ? {
              name: viverdeiaDomain.name,
              status: viverdeiaDomain.status,
              verified: viverdeiaDomain.status === 'verified'
            } : null,
            requestId
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      } catch (error: any) {
        console.error(`❌ [TEST-${requestId}] Erro ao listar domínios:`, error);
        
        return new Response(
          JSON.stringify({
            success: false,
            error: `Erro ao verificar domínios: ${error.message}`,
            solution: "Verifique as configurações de domínio no Resend",
            requestId
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    // Teste 3: Envio de email real
    if (testType === 'send_test' && email) {
      console.log(`📧 [TEST-${requestId}] Testando envio para: ${email}`);
      
      try {
        const emailResponse = await resend.emails.send({
          from: "Sistema <teste@viverdeia.ai>",
          to: [email],
          subject: `✅ Teste de Email - Sistema Operacional`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
              <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h1 style="color: #10b981; text-align: center; margin-bottom: 20px;">✅ Sistema de Email Funcional!</h1>
                
                <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                  Parabéns! O sistema de email está funcionando perfeitamente.
                </p>
                
                <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981; margin: 20px 0;">
                  <p style="margin: 0; color: #065f46; font-weight: 500;">
                    🎉 Teste realizado com sucesso em ${new Date().toLocaleString('pt-BR')}
                  </p>
                  <p style="margin: 5px 0 0 0; color: #065f46; font-size: 14px;">
                    Request ID: ${requestId}
                  </p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
                  Este é um email automático de teste do sistema Viver de IA
                </p>
              </div>
            </div>
          `,
          tags: [
            { name: 'type', value: 'system_test' },
            { name: 'request_id', value: requestId },
          ],
        });

        const responseTime = Date.now() - startTime;
        
        console.log(`✅ [TEST-${requestId}] Email enviado com sucesso:`, {
          emailId: emailResponse.data?.id,
          responseTime
        });
        
        return new Response(
          JSON.stringify({
            success: true,
            message: "Email de teste enviado com sucesso!",
            emailId: emailResponse.data?.id,
            responseTime,
            recipient: email,
            requestId
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      } catch (error: any) {
        console.error(`❌ [TEST-${requestId}] Erro ao enviar email:`, error);
        
        return new Response(
          JSON.stringify({
            success: false,
            error: `Erro ao enviar email: ${error.message}`,
            solution: "Verifique se o domínio está validado e o email está correto",
            recipient: email,
            requestId
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Tipo de teste inválido ou email não fornecido",
        requestId
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`❌ [TEST-${requestId}] Erro crítico:`, error);
    
    const responseTime = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `Erro crítico: ${error.message}`,
        responseTime,
        requestId
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("🧪 [TEST-RESEND] Edge Function de teste carregada!");
serve(handler);
