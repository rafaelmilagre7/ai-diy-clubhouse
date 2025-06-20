
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-function-timeout",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface InviteEmailRequest {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string;
  forceResend?: boolean;
  requestId?: string;
}

// Rate limiting em memória (simplificado)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(email: string, maxAttempts = 5, windowMinutes = 15): boolean {
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  const key = email.toLowerCase();
  
  const current = rateLimitMap.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxAttempts) {
    return false;
  }
  
  current.count++;
  return true;
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`📧 [INVITE-EMAIL-${requestId}] Nova requisição: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log(`🔄 [INVITE-EMAIL-${requestId}] CORS Preflight - respondendo`);
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  if (req.method !== "POST") {
    console.log(`❌ [INVITE-EMAIL-${requestId}] Método não permitido: ${req.method}`);
    return new Response(
      JSON.stringify({ error: "Método não permitido" }), 
      { 
        status: 405, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }

  const startTime = Date.now();

  try {
    console.log(`📨 [INVITE-EMAIL-${requestId}] Processando requisição POST...`);
    
    const requestData: InviteEmailRequest = await req.json();
    const { 
      email, 
      inviteUrl, 
      roleName, 
      expiresAt, 
      senderName, 
      notes, 
      forceResend = false 
    } = requestData;
    
    console.log(`📋 [INVITE-EMAIL-${requestId}] Dados recebidos:`, {
      email: email?.substring(0, 20) + '...',
      roleName,
      forceResend,
      hasNotes: !!notes
    });

    // Validações básicas
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email inválido" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Rate limiting (exceto para reenvios forçados)
    if (!forceResend && !checkRateLimit(email)) {
      console.warn(`⚠️ [INVITE-EMAIL-${requestId}] Rate limit excedido para: ${email}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Muitas tentativas de envio. Tente novamente em 15 minutos.",
          rateLimited: true
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`🔑 [INVITE-EMAIL-${requestId}] Verificando configurações...`);
    
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error(`❌ [INVITE-EMAIL-${requestId}] API key não configurada`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "RESEND_API_KEY não configurada nos secrets"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`✅ [INVITE-EMAIL-${requestId}] API key encontrada, enviando convite...`);

    const resend = new Resend(apiKey);

    // Template profissional do email de convite
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎯 Convite Especial</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Viver de IA - Transforme seu negócio</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin: 0 0 20px 0;">Você foi convidado!</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            ${senderName ? `<strong>${senderName}</strong> convidou você para` : 'Você foi convidado a'} 
            fazer parte da nossa plataforma como <strong style="color: #667eea;">${roleName}</strong>.
          </p>
          
          ${notes ? `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h4 style="margin: 0 0 8px 0; color: #333;">💌 Mensagem do convite:</h4>
              <p style="margin: 0; color: #555; font-style: italic;">"${notes}"</p>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; 
                      font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
              🚀 Aceitar Convite
            </a>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #333;">ℹ️ Informações importantes:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #555;">
              <li><strong>Papel:</strong> ${roleName}</li>
              <li><strong>Válido até:</strong> ${new Date(expiresAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</li>
              <li><strong>Email:</strong> ${email}</li>
            </ul>
          </div>
          
          <p style="color: #888; font-size: 14px; text-align: center; margin-top: 30px;">
            Este convite é pessoal e intransferível. Se você não esperava receber este email, 
            pode ignorá-lo com segurança.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
          © ${new Date().getFullYear()} Viver de IA - Transformando negócios com inteligência artificial
        </div>
      </div>
    `;

    // Retry com backoff exponencial
    let emailResponse;
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📤 [INVITE-EMAIL-${requestId}] Tentativa ${attempt}/${maxRetries}...`);
        
        emailResponse = await resend.emails.send({
          from: "Viver de IA <convites@viverdeia.ai>",
          to: [email],
          subject: `🎯 Convite para ${roleName} - Viver de IA`,
          html: emailHtml,
        });

        if (emailResponse.data?.id) {
          console.log(`✅ [INVITE-EMAIL-${requestId}] Email enviado com sucesso na tentativa ${attempt}`);
          break;
        }
      } catch (error: any) {
        lastError = error;
        console.error(`❌ [INVITE-EMAIL-${requestId}] Tentativa ${attempt} falhou:`, error.message);
        
        if (attempt < maxRetries) {
          const backoffTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          console.log(`⏳ [INVITE-EMAIL-${requestId}] Aguardando ${backoffTime}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
    }

    if (!emailResponse?.data?.id) {
      throw lastError || new Error("Falha em todas as tentativas de envio");
    }

    const responseTime = Date.now() - startTime;
    console.log(`✅ [INVITE-EMAIL-${requestId}] Convite enviado com sucesso:`, {
      emailId: emailResponse.data.id,
      responseTime,
      email: email.substring(0, 20) + '...'
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Convite enviado com sucesso",
        emailId: emailResponse.data.id,
        strategy: "resend_primary",
        method: "email",
        responseTime,
        requestId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`❌ [INVITE-EMAIL-${requestId}] Erro crítico:`, {
      message: error.message,
      stack: error.stack?.substring(0, 500),
      type: error.constructor.name
    });
    
    const responseTime = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno do servidor",
        strategy: "failed",
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

console.log("📧 [INVITE-EMAIL] Edge Function carregada com melhorias!");
serve(handler);
