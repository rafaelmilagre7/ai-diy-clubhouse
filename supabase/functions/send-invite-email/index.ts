
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-function-timeout",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SendInviteEmailRequest {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string;
  forceResend?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID().substring(0, 8);
  const startTime = Date.now();
  
  console.log(`📧 [INVITE-${requestId}] Iniciando processamento de convite: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log(`🔄 [INVITE-${requestId}] CORS Preflight - respondendo`);
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  if (req.method !== "POST") {
    console.log(`❌ [INVITE-${requestId}] Método não permitido: ${req.method}`);
    return new Response(
      JSON.stringify({ error: "Método não permitido" }), 
      { 
        status: 405, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }

  try {
    console.log(`📨 [INVITE-${requestId}] Processando requisição POST...`);
    
    // ETAPA 1: Validação de dados
    console.log(`🔍 [INVITE-${requestId}] ETAPA 1: Validando dados recebidos...`);
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout na leitura de dados")), 5000)
    );
    
    const data = await Promise.race([
      req.json(),
      timeoutPromise
    ]) as SendInviteEmailRequest;
    
    const { email, inviteUrl, roleName, expiresAt, senderName, notes, inviteId, forceResend } = data;
    
    console.log(`📋 [INVITE-${requestId}] Dados recebidos:`, {
      email: email?.substring(0, 20) + "...",
      roleName,
      hasInviteUrl: !!inviteUrl,
      hasInviteId: !!inviteId,
      forceResend,
      urlLength: inviteUrl?.length
    });

    // Validações básicas
    if (!email || !email.includes('@')) {
      console.log(`❌ [INVITE-${requestId}] Email inválido: ${email}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email inválido",
          strategy: "validation_failed"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!inviteUrl || inviteUrl.length < 10) {
      console.log(`❌ [INVITE-${requestId}] URL do convite inválida: ${inviteUrl}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "URL do convite inválida",
          strategy: "validation_failed"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // ETAPA 2: Configuração do Resend
    console.log(`🔑 [INVITE-${requestId}] ETAPA 2: Configurando Resend...`);
    
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error(`❌ [INVITE-${requestId}] API key não configurada`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "RESEND_API_KEY não configurada nos secrets",
          strategy: "config_error"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`✅ [INVITE-${requestId}] API key encontrada (${apiKey.substring(0, 8)}...)`);

    // ETAPA 3: Preparação do email com template simplificado
    console.log(`📝 [INVITE-${requestId}] ETAPA 3: Preparando template de email...`);
    
    const expirationDate = new Date(expiresAt);
    const formattedExpiration = expirationDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Template HTML simplificado para evitar problemas de renderização
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Convite - Viver de IA</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; }
          .role-badge { display: inline-block; background: #f0f9ff; color: #0369a1; padding: 8px 16px; border-radius: 20px; font-weight: 500; margin: 20px 0; }
          .cta-button { display: inline-block; background: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 30px 0; transition: all 0.3s; }
          .cta-button:hover { background: #1d4ed8; transform: translateY(-2px); }
          .details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
          .expiration { color: #ef4444; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Bem-vindo à Viver de IA!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Você foi convidado para fazer parte da nossa comunidade</p>
          </div>
          
          <div class="content">
            <p>Olá! 👋</p>
            
            <p>Você recebeu um convite especial para acessar a plataforma <strong>Viver de IA</strong> - sua jornada para dominar a Inteligência Artificial começa aqui!</p>
            
            <div class="role-badge">
              🎯 Papel: ${roleName}
            </div>
            
            <div class="details">
              <h3 style="margin-top: 0; color: #374151;">📋 Detalhes do Convite</h3>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Papel:</strong> ${roleName}</li>
                <li class="expiration"><strong>⏰ Expira em:</strong> ${formattedExpiration}</li>
                ${notes ? `<li><strong>Observações:</strong> ${notes}</li>` : ''}
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${inviteUrl}" class="cta-button">
                ✨ Aceitar Convite e Começar
              </a>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 30px 0;">
              <p style="margin: 0; color: #92400e;"><strong>⚠️ Importante:</strong> Este convite é pessoal e intransferível. Clique no botão acima para criar sua conta e começar sua jornada de aprendizado em IA.</p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              Se você não conseguir clicar no botão, copie e cole este link no seu navegador:<br>
              <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; word-break: break-all;">${inviteUrl}</code>
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Viver de IA</strong> - Transformando pessoas em especialistas em Inteligência Artificial</p>
            <p>Este é um email automático. Não é necessário responder.</p>
            <p style="margin-top: 20px; font-size: 12px;">ID do Convite: ${inviteId || requestId}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`📧 [INVITE-${requestId}] Template HTML preparado (${htmlContent.length} chars)`);

    // ETAPA 4: Envio do email com timeout
    console.log(`🚀 [INVITE-${requestId}] ETAPA 4: Enviando email via Resend...`);
    
    const resend = new Resend(apiKey);
    
    const emailTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout no envio do email")), 25000)
    );
    
    const emailPromise = resend.emails.send({
      from: "Viver de IA <sistema@viverdeia.ai>",
      to: [email],
      subject: `🚀 Convite Especial - Viver de IA (${roleName})`,
      html: htmlContent,
      headers: {
        'X-Entity-Ref-ID': inviteId || requestId,
        'X-Invite-Type': 'member-invitation',
        'X-Platform': 'viverdeia-ai'
      }
    });

    const emailResponse = await Promise.race([
      emailPromise,
      emailTimeoutPromise
    ]);

    const responseTime = Date.now() - startTime;
    
    console.log(`✅ [INVITE-${requestId}] Email enviado com sucesso!`, {
      emailId: emailResponse.data?.id,
      responseTime,
      to: email,
      strategy: 'resend_primary'
    });

    // ETAPA 5: Sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: "Convite enviado com sucesso",
        emailId: emailResponse.data?.id,
        email: email,
        strategy: "resend_primary",
        method: "html_template",
        responseTime,
        requestId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    console.error(`❌ [INVITE-${requestId}] Erro crítico na ETAPA atual:`, {
      message: error.message,
      stack: error.stack?.substring(0, 500),
      type: error.constructor.name,
      responseTime
    });
    
    // SISTEMA DE FALLBACK: Tentativa com Supabase Auth
    console.log(`🔄 [INVITE-${requestId}] Iniciando FALLBACK com Supabase Auth...`);
    
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseServiceKey) {
        console.log(`📱 [INVITE-${requestId}] Tentando envio via Supabase Auth...`);
        
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
          email,
          {
            data: {
              role: roleName,
              invited_by: 'sistema',
              invite_id: inviteId
            },
            redirectTo: inviteUrl
          }
        );

        if (!authError && authData) {
          console.log(`✅ [INVITE-${requestId}] Fallback bem-sucedido via Supabase Auth`);
          
          return new Response(
            JSON.stringify({
              success: true,
              message: "Convite enviado via sistema alternativo",
              emailId: authData.user?.id,
              email: email,
              strategy: "supabase_fallback",
              method: "auth_invite",
              responseTime,
              requestId,
              fallback_reason: error.message
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        }
        
        console.log(`❌ [INVITE-${requestId}] Fallback também falhou:`, authError?.message);
      }
    } catch (fallbackError: any) {
      console.error(`❌ [INVITE-${requestId}] Erro no fallback:`, fallbackError.message);
    }
    
    // Falha completa
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno do servidor",
        strategy: "all_failed",
        responseTime,
        requestId,
        details: {
          primary_error: error.message,
          fallback_attempted: true
        }
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("📧 [INVITE-EMAIL] Edge Function carregada com logs detalhados e fallback!");
serve(handler);
