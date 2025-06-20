
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`📧 [INVITE-${requestId}] Nova requisição de convite por email`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY não configurada");
    }

    const resend = new Resend(apiKey);

    const {
      email,
      inviteUrl,
      roleName,
      expiresAt,
      senderName = "Equipe Viver de IA",
      notes,
      inviteId,
      forceResend = false
    }: InviteEmailRequest = await req.json();

    // Rate limiting simples
    if (!forceResend) {
      const { data: recentAttempts } = await supabase
        .from('invite_send_attempts')
        .select('*')
        .eq('email', email)
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

      if (recentAttempts && recentAttempts.length >= 3) {
        throw new Error('Muitas tentativas recentes para este email. Aguarde 5 minutos.');
      }
    }

    console.log(`📨 [INVITE-${requestId}] Enviando convite para: ${email}`);

    // Template profissional do email
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Convite para Viver de IA</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                Você foi convidado!
            </h1>
            <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">
                Junte-se à comunidade Viver de IA
            </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Olá! 👋
            </p>
            
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${senderName} convidou você para se juntar à <strong>Viver de IA</strong> como <strong>${roleName}</strong>.
            </p>
            
            ${notes ? `
            <div style="background-color: #f1f5f9; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #475569; font-size: 14px; margin: 0; font-style: italic;">
                    "${notes}"
                </p>
            </div>
            ` : ''}
            
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                A Viver de IA é uma comunidade exclusiva focada em Inteligência Artificial para negócios, 
                onde você encontrará soluções práticas, networking qualificado e muito conhecimento.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: #ffffff; text-decoration: none; padding: 16px 32px; 
                          border-radius: 8px; font-weight: 600; font-size: 16px; 
                          box-shadow: 0 4px 14px rgba(102, 126, 234, 0.3);">
                    Aceitar Convite
                </a>
            </div>
            
            <!-- Features -->
            <div style="margin: 30px 0;">
                <h3 style="color: #1e293b; font-size: 18px; margin: 0 0 20px 0;">
                    O que você encontrará:
                </h3>
                <ul style="color: #475569; line-height: 1.8; padding-left: 20px;">
                    <li>🚀 Soluções práticas de IA para seu negócio</li>
                    <li>🎯 Implementações passo a passo</li>
                    <li>🤝 Networking com outros profissionais</li>
                    <li>📚 Formação completa em IA</li>
                    <li>💬 Suporte da comunidade</li>
                </ul>
            </div>
            
            <!-- Urgency -->
            <div style="background-color: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0; text-align: center;">
                    ⏰ <strong>Este convite expira em:</strong> ${new Date(expiresAt).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                Este é um convite exclusivo da Viver de IA
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                Se você não esperava este convite, pode ignorar este email.
            </p>
        </div>
    </div>
</body>
</html>`;

    // Registrar tentativa
    const attemptData = {
      email,
      invite_id: inviteId || null,
      method_attempted: 'resend_api',
      status: 'attempting'
    };

    const { data: attemptRecord } = await supabase
      .from('invite_send_attempts')
      .insert(attemptData)
      .select()
      .single();

    try {
      // Enviar email via Resend
      const emailResponse = await resend.emails.send({
        from: "Viver de IA <convites@viverdeia.ai>",
        to: [email],
        subject: `🚀 Você foi convidado para a Viver de IA - ${roleName}`,
        html: htmlTemplate,
        tags: [
          { name: 'type', value: 'invite' },
          { name: 'role', value: roleName },
          { name: 'requestId', value: requestId },
        ],
      });

      // Atualizar tentativa como sucesso
      if (attemptRecord) {
        await supabase
          .from('invite_send_attempts')
          .update({
            status: 'success',
            sent_at: new Date().toISOString(),
            email_id: emailResponse.data?.id
          })
          .eq('id', attemptRecord.id);
      }

      // Atualizar convite se tiver ID
      if (inviteId) {
        await supabase.rpc('update_invite_send_attempt', {
          invite_id: inviteId
        });
      }

      const responseTime = Date.now() - startTime;
      
      console.log(`✅ [INVITE-${requestId}] Email enviado com sucesso:`, {
        emailId: emailResponse.data?.id,
        responseTime,
        email
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Convite enviado com sucesso",
          emailId: emailResponse.data?.id,
          responseTime,
          requestId
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );

    } catch (emailError: any) {
      // Atualizar tentativa como falha
      if (attemptRecord) {
        await supabase
          .from('invite_send_attempts')
          .update({
            status: 'failed',
            error_message: emailError.message
          })
          .eq('id', attemptRecord.id);
      }

      // Adicionar à fila para retry
      try {
        await supabase.from('email_queue').insert({
          email,
          subject: `🚀 Você foi convidado para a Viver de IA - ${roleName}`,
          html_content: htmlTemplate,
          invite_id: inviteId || null,
          priority: 1, // Alta prioridade para convites
          status: 'pending'
        });
        
        console.log(`📝 [INVITE-${requestId}] Email adicionado à fila para retry`);
      } catch (queueError) {
        console.error(`❌ [INVITE-${requestId}] Erro ao adicionar à fila:`, queueError);
      }

      throw emailError;
    }

  } catch (error: any) {
    console.error(`❌ [INVITE-${requestId}] Erro crítico:`, error);
    
    const responseTime = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
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

console.log("📧 [INVITE-EMAIL] Edge Function carregada e pronta!");
serve(handler);
