
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { InviteEmail } from './_templates/invite-email.tsx';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendInviteRequest {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string;
  forceResend?: boolean;
}

// 🎯 CONFIGURAÇÃO DO DOMÍNIO CORRETO
const getCorrectDomain = (): string => {
  // Usar sempre o domínio personalizado para produção
  return 'https://app.viverdeia.ai';
};

const generateCorrectInviteUrl = (token: string): string => {
  const domain = getCorrectDomain();
  return `${domain}/convite/${encodeURIComponent(token)}`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📧 Processando convite para email...");

    const { 
      email, 
      inviteUrl, 
      roleName, 
      expiresAt, 
      senderName, 
      notes, 
      inviteId,
      forceResend = true 
    }: SendInviteRequest = await req.json();

    // Validações
    if (!email || !inviteUrl || !roleName || !expiresAt) {
      console.error("❌ Dados obrigatórios faltando");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Dados obrigatórios faltando: email, inviteUrl, roleName, expiresAt' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📧 Processando convite para: ${email}`, { forceResend });

    // 🎯 CORREÇÃO: Garantir que o URL use sempre o domínio correto
    let correctedInviteUrl = inviteUrl;
    
    // Extrair token do URL original e recriar com domínio correto
    const urlParts = inviteUrl.split('/convite/');
    if (urlParts.length === 2) {
      const token = urlParts[1];
      correctedInviteUrl = generateCorrectInviteUrl(token);
      console.log(`🔄 URL corrigido: ${inviteUrl} → ${correctedInviteUrl}`);
    }

    // Criar cliente Supabase para estatísticas
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

    // Estratégia 1: Tentar Resend primeiro (mais confiável)
    console.log("📨 Usando Resend como estratégia primária");
    
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    try {
      console.log("📧 Renderizando template React Email...");
      
      // Renderizar template React Email com URL corrigido
      const emailHtml = await renderAsync(
        React.createElement(InviteEmail, {
          inviteUrl: correctedInviteUrl, // 🎯 Usar URL corrigido
          roleName,
          expiresAt,
          senderName,
          notes,
          recipientEmail: email,
        })
      );

      console.log("📧 Enviando via Resend...");
      
      const resendResponse = await resend.emails.send({
        from: Deno.env.get("INVITE_FROM_EMAIL") || 'Viver de IA <convites@viverdeia.ai>',
        to: [email],
        subject: `🚀 Convite para Viver de IA - ${roleName}`,
        html: emailHtml,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
        },
        tags: [
          { name: 'category', value: 'invite' },
          { name: 'role', value: roleName },
          { name: 'source', value: 'admin-invite' },
        ],
      });

      if (resendResponse.error) {
        throw new Error(`Resend falhou: ${resendResponse.error.message}`);
      }

      console.log(`✅ Email enviado via Resend: ${resendResponse.data?.id}`);

      // Atualizar estatísticas do convite
      if (inviteId) {
        try {
          console.log("📊 Atualizando estatísticas...");
          
          await supabaseAdmin
            .from('invites')
            .update({
              last_sent_at: new Date().toISOString(),
              send_attempts: supabaseAdmin.sql`COALESCE(send_attempts, 0) + 1`,
              email_provider: 'resend',
              email_id: resendResponse.data?.id,
            })
            .eq('id', inviteId);

          console.log("📊 Estatísticas atualizadas");
        } catch (statsError) {
          console.warn("⚠️ Erro ao atualizar estatísticas:", statsError);
        }
      }

      console.log("✅ Convite processado com sucesso (resend_primary):", {
        email,
        role: roleName,
        strategy: 'resend_primary',
        correctedUrl: correctedInviteUrl
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email enviado via Resend (sistema otimizado)',
          email,
          strategy: 'resend_primary',
          method: 'resend',
          emailId: resendResponse.data?.id,
          finalUrl: correctedInviteUrl // 🎯 Informar URL final usado
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (resendError: any) {
      console.error("❌ Falha no Resend:", resendError);
      
      // Estratégia 2: Fallback para Supabase Auth
      console.log("🔄 Tentando fallback: Supabase Auth...");
      
      try {
        // Verificar se o usuário já existe
        const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email);
        
        if (existingUser.user) {
          console.log("👤 Usuário já existe, enviando link de recuperação...");
          
          const { error: recoveryError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: email,
            options: {
              redirectTo: correctedInviteUrl // 🎯 Usar URL corrigido
            }
          });

          if (recoveryError) {
            throw new Error(`Supabase recovery falhou: ${recoveryError.message}`);
          }

          console.log("✅ Link de recuperação enviado");

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Link de recuperação enviado (usuário existente)',
              email,
              strategy: 'supabase_recovery',
              method: 'recovery_link',
              finalUrl: correctedInviteUrl
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          console.log("👤 Usuário novo, enviando via Supabase Auth...");
          
          const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: correctedInviteUrl, // 🎯 Usar URL corrigido
            data: {
              role: roleName,
              invited_by: senderName,
              notes: notes
            }
          });

          if (inviteError) {
            throw new Error(`Supabase invite falhou: ${inviteError.message}`);
          }

          console.log("✅ Convite enviado via Supabase Auth");

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Convite enviado via Supabase Auth',
              email,
              strategy: 'supabase_auth',
              method: 'auth_invite',
              finalUrl: correctedInviteUrl
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (supabaseError: any) {
        console.error("❌ Fallback Supabase também falhou:", supabaseError);
        
        // Todas as estratégias falharam
        console.error("💥 Todas as estratégias falharam");
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Todas as estratégias de envio falharam',
            details: {
              resend_error: resendError.message,
              supabase_error: supabaseError.message
            }
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

  } catch (error: any) {
    console.error("❌ Erro crítico:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
