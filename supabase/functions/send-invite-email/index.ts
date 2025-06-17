
import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
}

interface SendResult {
  success: boolean;
  strategy: 'resend_primary' | 'supabase_recovery' | 'supabase_auth';
  method: string;
  email: string;
  emailId?: string;
  error?: string;
  timestamp: string;
}

// Logging utility with timestamps
const log = (level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

// Initialize clients
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

// Professional email template
const createEmailTemplate = (inviteUrl: string, roleName: string, expiresAt: string, senderName?: string, notes?: string) => {
  const formattedDate = new Date(expiresAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Convite - Viver de IA</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Viver de IA</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Você foi convidado para nossa plataforma!</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
            Olá! 👋
          </h2>
          
          <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            ${senderName ? `<strong>${senderName}</strong> convidou você para` : 'Você foi convidado(a) para'} 
            participar da <strong>Viver de IA</strong> como <strong>${roleName}</strong>.
          </p>
          
          ${notes ? `<div style="background-color: #f7fafc; border-left: 4px solid #667eea; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="color: #2d3748; margin: 0; font-style: italic;">"${notes}"</p>
          </div>` : ''}
          
          <p style="color: #4a5568; line-height: 1.6; margin: 20px 0; font-size: 16px;">
            Para aceitar o convite e criar sua conta, clique no botão abaixo:
          </p>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; 
                      font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                      transition: all 0.3s ease;">
              🚀 Aceitar Convite
            </a>
          </div>
          
          <!-- Important Info -->
          <div style="background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 16px; margin: 30px 0;">
            <h3 style="color: #c53030; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
              ⏰ Importante
            </h3>
            <p style="color: #742a2a; margin: 0; font-size: 14px;">
              Este convite expira em <strong>${formattedDate}</strong>. 
              Não perca esta oportunidade!
            </p>
          </div>
          
          <!-- Alternative Link -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
            <p style="color: #718096; font-size: 14px; margin: 0 0 10px 0;">
              Problemas com o botão? Copie e cole este link no seu navegador:
            </p>
            <p style="background-color: #f7fafc; padding: 12px; border-radius: 6px; font-family: monospace; 
                      font-size: 13px; color: #4a5568; word-break: break-all; margin: 0;">
              ${inviteUrl}
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #718096; font-size: 14px; margin: 0 0 10px 0;">
            Viver de IA - Transformando negócios com Inteligência Artificial
          </p>
          <p style="color: #a0aec0; font-size: 12px; margin: 0;">
            Se você não esperava este convite, pode ignorar este email com segurança.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Log attempt to database
const logSendAttempt = async (inviteId: string, email: string, method: string, status: 'attempting' | 'sent' | 'failed', emailId?: string, errorMessage?: string) => {
  try {
    await supabase.from('invite_send_attempts').insert({
      invite_id: inviteId,
      email,
      method_attempted: method,
      status,
      email_id: emailId,
      error_message: errorMessage,
      sent_at: status === 'sent' ? new Date().toISOString() : null
    });
  } catch (error) {
    log('ERROR', 'Failed to log send attempt', { error: error.message });
  }
};

// Strategy 1: Resend Primary (Professional template)
const sendViaResend = async (request: InviteEmailRequest): Promise<SendResult> => {
  const timestamp = new Date().toISOString();
  
  try {
    log('INFO', '📧 [STRATEGY-1] Attempting Resend Primary', { 
      email: request.email, 
      roleName: request.roleName 
    });

    if (request.inviteId) {
      await logSendAttempt(request.inviteId, request.email, 'resend_primary', 'attempting');
    }

    const emailTemplate = createEmailTemplate(
      request.inviteUrl, 
      request.roleName, 
      request.expiresAt, 
      request.senderName, 
      request.notes
    );

    const emailResponse = await resend.emails.send({
      from: 'Viver de IA <convites@viverdeia.com>',
      to: [request.email],
      subject: `🚀 Convite para Viver de IA - ${request.roleName}`,
      html: emailTemplate,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    });

    if (emailResponse.error) {
      throw new Error(`Resend API Error: ${emailResponse.error.message}`);
    }

    log('INFO', '✅ [STRATEGY-1] Resend Primary SUCCESS', { 
      emailId: emailResponse.data?.id,
      email: request.email 
    });

    if (request.inviteId) {
      await logSendAttempt(request.inviteId, request.email, 'resend_primary', 'sent', emailResponse.data?.id);
      await supabase.rpc('update_invite_send_attempt', { invite_id: request.inviteId });
    }

    return {
      success: true,
      strategy: 'resend_primary',
      method: 'professional_template',
      email: request.email,
      emailId: emailResponse.data?.id,
      timestamp
    };

  } catch (error) {
    log('ERROR', '❌ [STRATEGY-1] Resend Primary FAILED', { 
      error: error.message,
      email: request.email 
    });

    if (request.inviteId) {
      await logSendAttempt(request.inviteId, request.email, 'resend_primary', 'failed', undefined, error.message);
    }

    throw error;
  }
};

// Strategy 2: Supabase Auth Recovery (for existing users)
const sendViaSupabaseRecovery = async (request: InviteEmailRequest): Promise<SendResult> => {
  const timestamp = new Date().toISOString();
  
  try {
    log('INFO', '🔄 [STRATEGY-2] Attempting Supabase Recovery', { email: request.email });

    if (request.inviteId) {
      await logSendAttempt(request.inviteId, request.email, 'supabase_recovery', 'attempting');
    }

    const { error } = await supabase.auth.admin.resetPasswordForEmail(request.email, {
      redirectTo: request.inviteUrl
    });

    if (error) {
      throw new Error(`Supabase Recovery Error: ${error.message}`);
    }

    log('INFO', '✅ [STRATEGY-2] Supabase Recovery SUCCESS', { email: request.email });

    if (request.inviteId) {
      await logSendAttempt(request.inviteId, request.email, 'supabase_recovery', 'sent');
    }

    return {
      success: true,
      strategy: 'supabase_recovery',
      method: 'password_reset_link',
      email: request.email,
      timestamp
    };

  } catch (error) {
    log('ERROR', '❌ [STRATEGY-2] Supabase Recovery FAILED', { 
      error: error.message,
      email: request.email 
    });

    if (request.inviteId) {
      await logSendAttempt(request.inviteId, request.email, 'supabase_recovery', 'failed', undefined, error.message);
    }

    throw error;
  }
};

// Strategy 3: Supabase Auth Invite (fallback)
const sendViaSupabaseAuth = async (request: InviteEmailRequest): Promise<SendResult> => {
  const timestamp = new Date().toISOString();
  
  try {
    log('INFO', '🔑 [STRATEGY-3] Attempting Supabase Auth', { email: request.email });

    if (request.inviteId) {
      await logSendAttempt(request.inviteId, request.email, 'supabase_auth', 'attempting');
    }

    const { error } = await supabase.auth.admin.inviteUserByEmail(request.email, {
      redirectTo: request.inviteUrl,
      data: {
        role: request.roleName,
        invite_notes: request.notes,
        invited_by: request.senderName
      }
    });

    if (error) {
      throw new Error(`Supabase Auth Error: ${error.message}`);
    }

    log('INFO', '✅ [STRATEGY-3] Supabase Auth SUCCESS', { email: request.email });

    if (request.inviteId) {
      await logSendAttempt(request.inviteId, request.email, 'supabase_auth', 'sent');
    }

    return {
      success: true,
      strategy: 'supabase_auth',
      method: 'supabase_invitation',
      email: request.email,
      timestamp
    };

  } catch (error) {
    log('ERROR', '❌ [STRATEGY-3] Supabase Auth FAILED', { 
      error: error.message,
      email: request.email 
    });

    if (request.inviteId) {
      await logSendAttempt(request.inviteId, request.email, 'supabase_auth', 'failed', undefined, error.message);
    }

    throw error;
  }
};

// Main handler with intelligent fallback
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  log('INFO', '🚀 [INVITE-EMAIL] Request received', { method: req.method });

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Parse and validate request body
    const body: InviteEmailRequest = await req.json();
    log('INFO', '📋 [INVITE-EMAIL] Request parsed', { 
      email: body.email, 
      roleName: body.roleName,
      hasInviteId: !!body.inviteId 
    });

    // Input validation
    if (!body.email || !body.inviteUrl || !body.roleName) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: email, inviteUrl, roleName' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid email format' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if RESEND_API_KEY is configured
    const hasResendKey = !!Deno.env.get('RESEND_API_KEY');
    log('INFO', '🔑 [INVITE-EMAIL] Environment check', { hasResendKey });

    let result: SendResult;
    const strategies = [];

    // Add strategies based on configuration
    if (hasResendKey) {
      strategies.push(() => sendViaResend(body));
    }
    strategies.push(() => sendViaSupabaseRecovery(body));
    strategies.push(() => sendViaSupabaseAuth(body));

    log('INFO', '🎯 [INVITE-EMAIL] Strategy execution plan', { 
      totalStrategies: strategies.length,
      primaryStrategy: hasResendKey ? 'resend' : 'supabase_recovery'
    });

    // Execute strategies with intelligent fallback
    let lastError: Error | null = null;
    for (let i = 0; i < strategies.length; i++) {
      try {
        log('INFO', `🔄 [INVITE-EMAIL] Executing strategy ${i + 1}/${strategies.length}`);
        result = await strategies[i]();
        log('INFO', '✅ [INVITE-EMAIL] Strategy succeeded', { 
          strategy: result.strategy,
          duration: Date.now() - startTime
        });
        break;
      } catch (error) {
        lastError = error;
        log('WARN', `⚠️ [INVITE-EMAIL] Strategy ${i + 1} failed, trying next...`, { 
          error: error.message 
        });
        
        // If it's the last strategy, we'll throw
        if (i === strategies.length - 1) {
          throw error;
        }
      }
    }

    // If we got here without a result, all strategies failed
    if (!result!) {
      throw lastError || new Error('All email strategies failed');
    }

    const duration = Date.now() - startTime;
    log('INFO', '🎉 [INVITE-EMAIL] Request completed successfully', { 
      strategy: result.strategy,
      duration: `${duration}ms`,
      email: body.email
    });

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    log('ERROR', '💥 [INVITE-EMAIL] Request failed', { 
      error: error.message,
      duration: `${duration}ms`,
      stack: error.stack 
    });

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

// Add timeout wrapper
const timeoutHandler = async (req: Request): Promise<Response> => {
  const timeoutMs = 30000; // 30 seconds
  
  return Promise.race([
    handler(req),
    new Promise<Response>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Edge Function timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]).catch(error => {
    log('ERROR', '⏰ [TIMEOUT] Edge Function timed out', { error: error.message });
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Request timed out after ${timeoutMs}ms. Please try again.`,
        timeout: true 
      }),
      { status: 408, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  });
};

serve(timeoutHandler);
