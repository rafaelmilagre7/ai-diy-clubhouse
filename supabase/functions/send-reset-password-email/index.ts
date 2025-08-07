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
  console.log('🚀 [SEND-RESET-PASSWORD-EMAIL] Processamento iniciado');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não configurado');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const body: SendResetPasswordEmailRequest = await req.json();
    console.log('📧 [SEND-RESET-PASSWORD-EMAIL] Dados recebidos:', {
      email: body.email,
      resetUrl: body.resetUrl
    });

    // Dados do template
    const templateData = {
      resetUrl: body.resetUrl,
      recipientEmail: body.email,
      companyName: 'Viver de IA',
    };
    
    console.log('📋 [SEND-RESET-PASSWORD-EMAIL] Dados do template:', templateData);

    // Renderizar template do email
    const emailHtml = await renderAsync(
      React.createElement(ResetPasswordEmail, templateData)
    );

    console.log('📝 [SEND-RESET-PASSWORD-EMAIL] Template renderizado com sucesso');

    // Enviar email via Resend (usando o mesmo from do sistema de convites)
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: 'Viver de IA <convites@viverdeia.ai>',
      to: [body.email],
      subject: '🔐 Redefinição de senha - Viver de IA',
      html: emailHtml,
      replyTo: 'suporte@viverdeia.ai',
    });

    if (emailError) {
      console.error('❌ [SEND-RESET-PASSWORD-EMAIL] Erro no Resend:', emailError);
      throw emailError;
    }

    console.log('✅ [SEND-RESET-PASSWORD-EMAIL] Email enviado com sucesso:', emailResult?.id);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: emailResult?.id,
        sentAt: new Date().toISOString(),
        recipient: body.email
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ [SEND-RESET-PASSWORD-EMAIL] Erro geral:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Falha no envio do email de recuperação de senha'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);