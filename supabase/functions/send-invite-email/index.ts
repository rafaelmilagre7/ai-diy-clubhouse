
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
  recoveryMode?: boolean;
  recoveryId?: string;
  requestId?: string;
}

// Rate limiting por IP/email
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS_PER_WINDOW = 10;

// Função para verificar rate limiting
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const existing = rateLimitMap.get(identifier);
  
  if (!existing || now > existing.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (existing.count >= MAX_ATTEMPTS_PER_WINDOW) {
    return false;
  }
  
  existing.count++;
  return true;
}

// Template profissional para convites
function getInviteTemplate(inviteUrl: string, roleName: string, senderName?: string, notes?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Convite - Viver de IA</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Viver de IA</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Você foi convidado para nossa plataforma!</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">🎉 Bem-vindo à Viver de IA!</h2>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">
              ${senderName ? `<strong>${senderName}</strong> convidou você para` : 'Você foi convidado para'} 
              participar da nossa plataforma como <strong style="color: #667eea;">${roleName}</strong>.
            </p>
            
            ${notes ? `
            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">📝 Mensagem do convite:</h4>
              <p style="margin: 0; color: #666; font-style: italic;">${notes}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); transition: transform 0.2s;">
                🚀 Aceitar Convite
              </a>
            </div>
            
            <div style="background-color: #e8f2ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #1a472a; font-size: 16px;">✨ O que você vai encontrar:</h4>
              <ul style="margin: 10px 0; padding-left: 20px; color: #2d5a87;">
                <li>Acesso exclusivo a soluções de IA para negócios</li>
                <li>Comunidade de empreendedores inovadores</li>
                <li>Cursos práticos e implementações reais</li>
                <li>Suporte especializado da nossa equipe</li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">
              <strong>Link direto:</strong><br>
              <span style="color: #999; word-break: break-all;">${inviteUrl}</span>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; font-size: 12px; color: #6c757d;">
              Este convite foi enviado pela plataforma Viver de IA.<br>
              Se você não estava esperando este convite, pode ignorar este email.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #6c757d;">
              © ${new Date().getFullYear()} Viver de IA - Transformando negócios com Inteligência Artificial
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Função para salvar na fila de fallback
async function saveToEmailQueue(supabase: any, emailData: any, error: string, requestId: string) {
  try {
    const { error: queueError } = await supabase
      .from('email_queue')
      .insert({
        email: emailData.email,
        subject: 'Convite para Viver de IA',
        html_content: getInviteTemplate(emailData.inviteUrl, emailData.roleName, emailData.senderName, emailData.notes),
        recipient_name: emailData.email.split('@')[0],
        invite_id: emailData.inviteId,
        request_id: requestId,
        priority: emailData.recoveryMode ? 'high' : 'normal',
        status: 'pending',
        attempts: 0,
        last_error: error,
        retry_after: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos
        metadata: {
          roleName: emailData.roleName,
          senderName: emailData.senderName,
          notes: emailData.notes,
          recoveryMode: emailData.recoveryMode,
          originalError: error
        }
      });

    if (queueError) {
      console.error(`❌ [${requestId}] Erro ao salvar na fila:`, queueError);
    } else {
      console.log(`📥 [${requestId}] Email salvo na fila para retry`);
    }
  } catch (err) {
    console.error(`❌ [${requestId}] Erro crítico ao salvar na fila:`, err);
  }
}

// Função de retry com backoff exponencial
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  requestId: string
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [${requestId}] Tentativa ${attempt}/${maxRetries}`);
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.error(`❌ [${requestId}] Tentativa ${attempt} falhou:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        console.log(`⏳ [${requestId}] Aguardando ${Math.round(delay)}ms antes da próxima tentativa`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`📧 [INVITE-${requestId}] Nova requisição: ${req.method}`);
  
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

  const startTime = Date.now();

  try {
    console.log(`📨 [INVITE-${requestId}] Processando convite...`);
    
    const emailData: InviteEmailRequest = await req.json();
    const { email, inviteUrl, roleName, expiresAt, senderName, notes, inviteId, forceResend, recoveryMode } = emailData;
    
    if (!email || !inviteUrl || !roleName) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Dados obrigatórios ausentes (email, inviteUrl, roleName)" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Rate limiting (apenas se não for force resend ou recovery mode)
    if (!forceResend && !recoveryMode) {
      const rateLimitKey = `${email}-${req.headers.get('x-forwarded-for') || 'unknown'}`;
      if (!checkRateLimit(rateLimitKey)) {
        console.warn(`⚠️ [INVITE-${requestId}] Rate limit excedido para: ${email}`);
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
    }

    console.log(`🔑 [INVITE-${requestId}] Verificando configurações...`);
    
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error(`❌ [INVITE-${requestId}] API key não configurada`);
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

    // Inicializar Supabase client para salvar na fila se necessário
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`✅ [INVITE-${requestId}] Enviando email via Resend...`);

    const resend = new Resend(apiKey);
    
    // Envio com retry inteligente
    const emailResponse = await retryWithBackoff(async () => {
      return await resend.emails.send({
        from: "Viver de IA <convites@viverdeia.ai>",
        to: [email],
        subject: `🎉 Você foi convidado para a Viver de IA - ${roleName}`,
        html: getInviteTemplate(inviteUrl, roleName, senderName, notes),
        tags: [
          { name: 'type', value: 'invite' },
          { name: 'role', value: roleName },
          { name: 'recovery_mode', value: recoveryMode ? 'true' : 'false' },
        ],
      });
    }, 3, 1000, requestId);

    // Atualizar estatísticas do convite se tiver ID
    if (inviteId && supabase) {
      try {
        const { error: updateError } = await supabase.rpc('update_invite_send_attempt', {
          invite_id: inviteId
        });

        if (updateError) {
          console.error(`⚠️ [INVITE-${requestId}] Erro ao atualizar estatísticas:`, updateError);
        }
      } catch (statsError) {
        console.error(`⚠️ [INVITE-${requestId}] Erro nas estatísticas:`, statsError);
      }
    }

    const responseTime = Date.now() - startTime;
    console.log(`✅ [INVITE-${requestId}] Email enviado com sucesso!`, {
      emailId: emailResponse.data?.id,
      responseTime
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Convite enviado com sucesso",
        emailId: emailResponse.data?.id,
        responseTime,
        strategy: "resend_direct",
        method: "resend_api",
        requestId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`❌ [INVITE-${requestId}] Erro crítico:`, {
      message: error.message,
      stack: error.stack?.substring(0, 500),
      type: error.constructor.name
    });
    
    // Tentar salvar na fila para retry posterior
    try {
      const emailData = await req.clone().json();
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await saveToEmailQueue(supabase, emailData, error.message, requestId);
    } catch (queueError) {
      console.error(`❌ [INVITE-${requestId}] Falha crítica ao salvar na fila:`, queueError);
    }
    
    const responseTime = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno do servidor",
        responseTime,
        requestId,
        suggestion: "O convite foi salvo na fila para nova tentativa automática"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("📧 [INVITE] Edge Function carregada com melhorias críticas!");
serve(handler);
