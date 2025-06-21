
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-security-level",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface InviteRequest {
  inviteId: string;
  email: string;
  whatsappNumber?: string;
  roleId: string;
  token: string;
  channels: ('email' | 'whatsapp')[];
  userName?: string;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log(`🎯 [INVITE-ORCHESTRATOR] Nova requisição: ${req.method} - v4.0 Template System`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido" }), 
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { inviteId, email, whatsappNumber, roleId, token, channels, userName, notes }: InviteRequest = await req.json();
    
    console.log(`📧 [INVITE-ORCHESTRATOR] Processando convite para: ${email}, Canais: ${channels.join(', ')}, Nome: ${userName || 'N/A'}`);

    // Inicializar cliente Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const results: Array<{ channel: string; success: boolean; error?: string; providerId?: string }> = [];

    // Enviar por e-mail se solicitado
    if (channels.includes('email')) {
      try {
        console.log(`📧 [INVITE-ORCHESTRATOR] Enviando por e-mail...`);
        
        const emailResponse = await supabase.functions.invoke('send-invite-email', {
          body: {
            inviteId,
            email,
            roleId,
            token,
            notes
          }
        });

        if (emailResponse.error) {
          throw new Error(emailResponse.error.message);
        }

        const emailData = emailResponse.data;
        
        results.push({
          channel: 'email',
          success: emailData.success,
          providerId: emailData.emailId,
          error: emailData.success ? undefined : emailData.error
        });

        // Log do resultado do e-mail
        await supabase.rpc('log_invite_delivery', {
          p_invite_id: inviteId,
          p_channel: 'email',
          p_status: emailData.success ? 'sent' : 'failed',
          p_provider_id: emailData.emailId,
          p_error_message: emailData.success ? null : emailData.error,
          p_metadata: { userName }
        });

        console.log(`✅ [INVITE-ORCHESTRATOR] E-mail ${emailData.success ? 'enviado' : 'falhou'}`);
      } catch (emailError: any) {
        console.error(`❌ [INVITE-ORCHESTRATOR] Erro no e-mail:`, emailError);
        
        results.push({
          channel: 'email',
          success: false,
          error: emailError.message
        });

        // Log do erro do e-mail
        await supabase.rpc('log_invite_delivery', {
          p_invite_id: inviteId,
          p_channel: 'email',
          p_status: 'failed',
          p_error_message: emailError.message,
          p_metadata: { userName }
        });
      }
    }

    // Enviar por WhatsApp se solicitado e número disponível
    if (channels.includes('whatsapp') && whatsappNumber) {
      try {
        console.log(`📱 [INVITE-ORCHESTRATOR] Enviando por WhatsApp com template...`);
        
        // Validar se userName foi fornecido para WhatsApp (obrigatório para template)
        if (!userName || userName.trim() === '') {
          throw new Error("Nome do usuário é obrigatório para envio via WhatsApp template");
        }
        
        const whatsappResponse = await supabase.functions.invoke('send-invite-whatsapp', {
          body: {
            inviteId,
            whatsappNumber,
            roleId,
            token,
            userName: userName.trim(),
            notes
          }
        });

        if (whatsappResponse.error) {
          throw new Error(whatsappResponse.error.message);
        }

        const whatsappData = whatsappResponse.data;
        
        results.push({
          channel: 'whatsapp',
          success: whatsappData.success,
          providerId: whatsappData.messageId,
          error: whatsappData.success ? undefined : whatsappData.error
        });

        // Log do resultado do WhatsApp
        await supabase.rpc('log_invite_delivery', {
          p_invite_id: inviteId,
          p_channel: 'whatsapp',
          p_status: whatsappData.success ? 'sent' : 'failed',
          p_provider_id: whatsappData.messageId,
          p_error_message: whatsappData.success ? null : whatsappData.error,
          p_metadata: { 
            userName, 
            whatsappNumber, 
            templateUsed: whatsappData.templateUsed,
            templateId: whatsappData.templateId
          }
        });

        console.log(`✅ [INVITE-ORCHESTRATOR] WhatsApp template ${whatsappData.success ? 'enviado' : 'falhou'}`);
      } catch (whatsappError: any) {
        console.error(`❌ [INVITE-ORCHESTRATOR] Erro no WhatsApp:`, whatsappError);
        
        results.push({
          channel: 'whatsapp',
          success: false,
          error: whatsappError.message
        });

        // Log do erro do WhatsApp
        await supabase.rpc('log_invite_delivery', {
          p_invite_id: inviteId,
          p_channel: 'whatsapp',
          p_status: 'failed',
          p_error_message: whatsappError.message,
          p_metadata: { userName, whatsappNumber }
        });
      }
    }

    // Calcular resultado geral
    const successfulChannels = results.filter(r => r.success);
    const failedChannels = results.filter(r => !r.success);
    
    const overallSuccess = successfulChannels.length > 0;
    
    console.log(`🎯 [INVITE-ORCHESTRATOR] Resultado final: ${successfulChannels.length}/${results.length} canais bem-sucedidos`);

    return new Response(
      JSON.stringify({
        success: overallSuccess,
        message: overallSuccess 
          ? `Convite enviado com sucesso via ${successfulChannels.map(r => r.channel).join(' e ')}`
          : `Falha ao enviar convite via ${failedChannels.map(r => r.channel).join(' e ')}`,
        results,
        summary: {
          totalChannels: results.length,
          successfulChannels: successfulChannels.length,
          failedChannels: failedChannels.length
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`❌ [INVITE-ORCHESTRATOR] Erro crítico:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno do servidor",
        message: "Falha na orquestração do convite"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("🎯 [INVITE-ORCHESTRATOR] Edge Function carregada com sistema de templates! v4.0");
serve(handler);
