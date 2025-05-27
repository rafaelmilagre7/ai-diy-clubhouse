
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

// Inicializar Resend
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: InviteEmailRequest = await req.json();
    
    console.log("📧 Processando convite para:", data.email, { forceResend: data.forceResend });
    
    // Validações básicas
    if (!data.email || !data.roleName) {
      throw new Error("Dados obrigatórios ausentes (email e roleName são obrigatórios)");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Formato de email inválido");
    }

    // Criar cliente do Supabase com service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    let strategy = 'resend_primary';
    let success = false;
    let errorMessage = '';
    
    // NOVA ESTRATÉGIA: Usar Resend como primeira opção
    if (data.forceResend || true) { // Sempre usar Resend agora
      console.log("📨 Usando Resend como estratégia primária");
      
      try {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Convite - Viver de IA</title>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px;
                background-color: #f8fafc;
              }
              .container {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center; 
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
              }
              .content { 
                padding: 40px 30px; 
              }
              .button { 
                display: inline-block; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 16px 32px; 
                text-decoration: none; 
                border-radius: 8px; 
                font-weight: 600; 
                font-size: 16px;
                margin: 24px 0; 
                transition: transform 0.2s;
              }
              .button:hover {
                transform: translateY(-2px);
              }
              .footer { 
                text-align: center; 
                margin-top: 40px; 
                color: #666; 
                font-size: 14px; 
                padding: 20px;
                background-color: #f8fafc;
              }
              .info-box { 
                background: #e3f2fd; 
                border-left: 4px solid #2196f3; 
                padding: 20px; 
                margin: 24px 0; 
                border-radius: 0 8px 8px 0;
              }
              .features {
                background: #f0f9ff;
                padding: 24px;
                border-radius: 8px;
                margin: 24px 0;
              }
              .features ul {
                margin: 0;
                padding-left: 20px;
              }
              .features li {
                margin: 8px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Você foi convidado!</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Bem-vindo ao Viver de IA</p>
              </div>
              
              <div class="content">
                <p style="font-size: 18px; margin-bottom: 24px;">Olá!</p>
                
                <p><strong>${data.senderName || 'Nossa equipe'}</strong> convidou você para fazer parte da <strong>Viver de IA</strong>, a comunidade de empresários que implementam soluções de IA em seus negócios.</p>
                
                <div class="info-box">
                  <p><strong>📋 Detalhes do seu convite:</strong></p>
                  <ul style="margin: 12px 0;">
                    <li><strong>Papel:</strong> ${data.roleName}</li>
                    <li><strong>Válido até:</strong> ${new Date(data.expiresAt).toLocaleDateString('pt-BR')}</li>
                    ${data.notes ? `<li><strong>Observações:</strong> ${data.notes}</li>` : ''}
                  </ul>
                </div>
                
                <p style="margin: 32px 0 24px 0; font-size: 16px;">Clique no botão abaixo para aceitar o convite e criar sua conta:</p>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${data.inviteUrl}" class="button">✨ Aceitar Convite</a>
                </div>
                
                <p style="font-size: 14px; color: #666; text-align: center;"><small>Este link é válido até ${new Date(data.expiresAt).toLocaleDateString('pt-BR')} às ${new Date(data.expiresAt).toLocaleTimeString('pt-BR')}.</small></p>
                
                <div class="features">
                  <p><strong>🚀 O que você encontrará na Viver de IA:</strong></p>
                  <ul>
                    <li>Trilhas personalizadas de implementação de IA</li>
                    <li>Comunidade exclusiva de empresários</li>
                    <li>Soluções práticas e testadas</li>
                    <li>Networking com outros empreendedores</li>
                    <li>Suporte especializado</li>
                    <li>Ferramentas e benefícios exclusivos</li>
                  </ul>
                </div>
              </div>
              
              <div class="footer">
                <p>Este convite foi enviado por <strong>${data.senderName || 'Viver de IA'}</strong></p>
                <p>Se você não esperava este convite, pode ignorar este email.</p>
                <p style="margin-top: 20px;"><strong>Viver de IA</strong> - Transforme seu negócio com Inteligência Artificial</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const emailText = `
          Você foi convidado para o Viver de IA!
          
          ${data.senderName || 'Nossa equipe'} convidou você para fazer parte da Viver de IA.
          
          Papel: ${data.roleName}
          Válido até: ${new Date(data.expiresAt).toLocaleDateString('pt-BR')}
          ${data.notes ? `Observações: ${data.notes}` : ''}
          
          Aceite o convite clicando no link: ${data.inviteUrl}
          
          Viver de IA - Transforme seu negócio com Inteligência Artificial
        `;

        console.log("📧 Enviando via Resend...");
        const emailResult = await resend.emails.send({
          from: 'Viver de IA <convites@viverdeia.ai>',
          to: [data.email],
          subject: `🎉 Você foi convidado para o Viver de IA - ${data.roleName}`,
          html: emailHtml,
          text: emailText,
          headers: {
            'X-Entity-Ref-ID': data.inviteId || crypto.randomUUID(),
          },
        });

        if (emailResult.error) {
          console.error("❌ Erro no Resend:", emailResult.error);
          throw new Error(`Resend falhou: ${emailResult.error.message}`);
        }

        console.log("✅ Email enviado via Resend:", emailResult.data?.id);
        success = true;
        strategy = 'resend_primary';
        
      } catch (resendError: any) {
        console.error("❌ Erro no Resend:", resendError);
        errorMessage = `Resend falhou: ${resendError.message}`;
        
        // Fallback para Supabase Auth apenas se Resend falhar
        console.log("🔄 Tentando fallback com Supabase Auth...");
        
        try {
          const inviteResult = await supabaseAdmin.auth.admin.inviteUserByEmail(
            data.email,
            {
              data: {
                role: data.roleName,
                sender_name: data.senderName || 'Viver de IA',
                notes: data.notes || '',
                invite_url: data.inviteUrl,
                expires_at: data.expiresAt,
                invite_id: data.inviteId
              },
              redirectTo: data.inviteUrl
            }
          );

          if (inviteResult.error) {
            if (inviteResult.error.message.includes('already been registered')) {
              console.log("🔄 Usuário existente - gerando link de recuperação");
              
              const recoveryResult = await supabaseAdmin.auth.admin.generateLink({
                type: 'recovery',
                email: data.email,
                options: {
                  redirectTo: data.inviteUrl
                }
              });
              
              if (!recoveryResult.error) {
                console.log("✅ Link de recuperação gerado via Supabase");
                success = true;
                strategy = 'supabase_recovery';
              }
            }
          } else {
            console.log("✅ Convite enviado via Supabase Auth");
            success = true;
            strategy = 'supabase_auth';
          }
        } catch (supabaseError: any) {
          console.error("❌ Erro no Supabase fallback:", supabaseError);
          errorMessage += ` | Supabase também falhou: ${supabaseError.message}`;
        }
      }
    }

    // Atualizar estatísticas se fornecido invite_id
    if (data.inviteId) {
      try {
        await supabaseAdmin.rpc('update_invite_send_attempt', {
          invite_id: data.inviteId
        });
        console.log("📊 Estatísticas atualizadas");
      } catch (statsError: any) {
        console.warn("⚠️ Erro ao atualizar estatísticas:", statsError.message);
      }
    }

    if (success) {
      console.log(`✅ Convite processado com sucesso (${strategy}):`, {
        email: data.email,
        role: data.roleName,
        strategy: strategy
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Convite enviado com sucesso",
          email: data.email,
          strategy: strategy,
          method: 'resend_priority_system'
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      console.error("❌ Todas as estratégias falharam:", errorMessage);
      
      return new Response(
        JSON.stringify({
          success: false,
          message: "Falha em todas as estratégias de envio",
          error: errorMessage,
          details: "Tanto Resend quanto Supabase falharam"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

  } catch (error: any) {
    console.error("❌ Erro crítico ao processar convite:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Erro crítico no processamento",
        error: error.message,
        details: "Verifique os logs para mais informações"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
