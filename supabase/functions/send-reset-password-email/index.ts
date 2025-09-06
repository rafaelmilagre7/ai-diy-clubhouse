import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { ResetPasswordEmail } from './_templates/reset-password-email.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendResetPasswordEmailRequest {
  email: string;
  resetUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🚀 [RESET-${requestId}] Processamento iniciado`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.error(`❌ [RESET-${requestId}] Método não permitido: ${req.method}`);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verificar secrets necessários
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log(`🔍 [RESET-${requestId}] Verificando configurações...`);
    console.log(`🔍 [RESET-${requestId}] RESEND_API_KEY: ${resendApiKey ? '✅ Configurado' : '❌ Faltando'}`);
    console.log(`🔍 [RESET-${requestId}] SUPABASE_URL: ${supabaseUrl ? '✅ Configurado' : '❌ Faltando'}`);
    console.log(`🔍 [RESET-${requestId}] SUPABASE_SERVICE_KEY: ${supabaseServiceKey ? '✅ Configurado' : '❌ Faltando'}`);

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não configurado nas variáveis de ambiente');
    }
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const body: SendResetPasswordEmailRequest = await req.json();
    console.log(`📧 [RESET-${requestId}] Dados recebidos:`, {
      email: body.email,
      resetUrl: body.resetUrl ? '[URL PROVIDED]' : '[NO URL]'
    });

    // Validar email
    if (!body.email || !body.email.includes('@')) {
      throw new Error('Email inválido fornecido');
    }

    // Configurar domínio e URL de redirecionamento
    const customDomain = 'https://app.viverdeia.ai';
    const resetRedirectUrl = `${customDomain}/set-new-password`;
    
    console.log(`🔧 [RESET-${requestId}] Configurações:`, {
      customDomain,
      resetRedirectUrl
    });
    
    // Tentar gerar link de recuperação com retry
    let resetAttempts = 0;
    let resetData = null;
    let resetError = null;
    
    while (resetAttempts < 3) {
      resetAttempts++;
      console.log(`🔗 [RESET-${requestId}] Tentativa ${resetAttempts} de gerar link...`);
      
      const result = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: body.email,
        options: {
          redirectTo: resetRedirectUrl
        }
      });
      
      if (result.error) {
        resetError = result.error;
        console.warn(`⚠️ [RESET-${requestId}] Tentativa ${resetAttempts} falhou:`, resetError);
        
        if (resetAttempts < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * resetAttempts));
          continue;
        }
      } else {
        resetData = result.data;
        break;
      }
    }

    if (resetError || !resetData) {
      console.error(`❌ [RESET-${requestId}] Falha ao gerar link após ${resetAttempts} tentativas:`, resetError);
      throw new Error(`Erro do Supabase: ${resetError?.message || 'Falha ao gerar link de recuperação'}`);
    }

    if (!resetData?.properties?.action_link) {
      throw new Error('Link de recuperação não foi gerado pelo Supabase');
    }

    console.log(`✅ [RESET-${requestId}] Link gerado com sucesso`);
    
    const resetLinkWithTokens = resetData.properties.action_link;
    
    // Verificar domínio no link
    if (resetLinkWithTokens.includes('app.viverdeia.ai')) {
      console.log(`✅ [RESET-${requestId}] Domínio personalizado detectado no link`);
    } else {
      console.warn(`⚠️ [RESET-${requestId}] Link usando domínio diferente:`, resetLinkWithTokens);
    }

    // Preparar dados do template
    const templateData = {
      resetUrl: resetLinkWithTokens,
      recipientEmail: body.email,
      companyName: 'Viver de IA',
    };
    
    console.log(`📋 [RESET-${requestId}] Renderizando template...`);

    // Renderizar template do email
    let emailHtml;
    try {
      emailHtml = await renderAsync(React.createElement(ResetPasswordEmail, templateData));
      console.log(`📝 [RESET-${requestId}] Template renderizado com sucesso`);
    } catch (templateError) {
      console.error(`❌ [RESET-${requestId}] Erro ao renderizar template:`, templateError);
      throw new Error(`Erro no template: ${templateError.message}`);
    }

    // Tentar envio com domínio personalizado e fallback
    let emailResult = null;
    let emailError = null;
    let fromAddress = 'Viver de IA <convites@viverdeia.ai>';
    
    console.log(`📤 [RESET-${requestId}] Tentando envio com domínio personalizado...`);
    
    try {
      const result = await resend.emails.send({
        from: fromAddress,
        to: [body.email],
        subject: '🔐 Redefinição de senha - Viver de IA',
        html: emailHtml,
        replyTo: 'suporte@viverdeia.ai',
      });
      
      if (result.error) {
        emailError = result.error;
      } else {
        emailResult = result.data;
      }
    } catch (sendError) {
      emailError = sendError;
    }

    // Se falhar com domínio personalizado, tentar com domínio padrão
    if (emailError && emailError.message?.includes('domain')) {
      console.warn(`⚠️ [RESET-${requestId}] Domínio personalizado falhou, tentando com domínio padrão...`);
      fromAddress = 'Viver de IA <onboarding@resend.dev>';
      
      try {
        const fallbackResult = await resend.emails.send({
          from: fromAddress,
          to: [body.email],
          subject: '🔐 Redefinição de senha - Viver de IA',
          html: emailHtml,
        });
        
        if (fallbackResult.error) {
          emailError = fallbackResult.error;
        } else {
          emailResult = fallbackResult.data;
          emailError = null; // Reset error since fallback worked
          console.log(`✅ [RESET-${requestId}] Email enviado com domínio padrão`);
        }
      } catch (fallbackError) {
        emailError = fallbackError;
      }
    }

    if (emailError) {
      console.error(`❌ [RESET-${requestId}] Erro final no Resend:`, emailError);
      throw new Error(`Erro no envio de email: ${emailError.message}`);
    }

    if (!emailResult) {
      throw new Error('Email não foi enviado - resultado vazio');
    }

    console.log(`✅ [RESET-${requestId}] Email enviado com sucesso:`, {
      messageId: emailResult.id,
      from: fromAddress,
      to: body.email
    });

    return new Response(
      JSON.stringify({
        success: true,
        messageId: emailResult.id,
        sentAt: new Date().toISOString(),
        recipient: body.email,
        requestId: requestId
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error(`❌ [RESET-${requestId}] Erro geral:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Determinar tipo de erro para resposta mais específica
    let errorMessage = 'Falha no envio do email de recuperação de senha';
    let statusCode = 500;
    
    if (error.message.includes('RESEND_API_KEY')) {
      errorMessage = 'Serviço de email não configurado corretamente';
      statusCode = 503;
    } else if (error.message.includes('Email inválido')) {
      errorMessage = 'Email fornecido é inválido';
      statusCode = 400;
    } else if (error.message.includes('Supabase')) {
      errorMessage = 'Erro na autenticação - tente novamente';
      statusCode = 503;
    } else if (error.message.includes('domain')) {
      errorMessage = 'Erro na configuração de email - contate o suporte';
      statusCode = 503;
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        details: error.message,
        requestId: requestId,
        timestamp: new Date().toISOString()
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);