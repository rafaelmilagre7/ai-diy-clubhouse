
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-security-level",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface InviteOrchestratorRequest {
  inviteId: string;
  email: string;
  whatsappNumber?: string;
  roleId: string;
  token: string;
  channels: ('email' | 'whatsapp')[];
  userName?: string;
  notes?: string;
  isResend?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  console.log(`🎯 [INVITE-ORCHESTRATOR] Nova requisição: ${req.method} - v4.2 Corrigido`);
  
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
    const requestBody: InviteOrchestratorRequest = await req.json();
    
    console.log(`📧 [INVITE-ORCHESTRATOR] Dados recebidos:`, {
      inviteId: requestBody.inviteId,
      email: requestBody.email,
      channels: requestBody.channels,
      hasWhatsappNumber: !!requestBody.whatsappNumber,
      hasUserName: !!requestBody.userName,
      isResend: requestBody.isResend || false
    });

    const {
      inviteId,
      email,
      whatsappNumber,
      roleId,
      token,
      channels,
      userName,
      notes,
      isResend = false
    } = requestBody;

    // Validações de entrada
    if (!Array.isArray(channels) || channels.length === 0) {
      console.error(`❌ [INVITE-ORCHESTRATOR] Canais inválidos:`, channels);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Pelo menos um canal deve ser especificado",
          message: "Canais de envio não especificados corretamente"
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validação específica para WhatsApp
    if (channels.includes('whatsapp')) {
      if (!userName || userName.trim() === '') {
        console.error(`❌ [INVITE-ORCHESTRATOR] Nome obrigatório para WhatsApp`);
        return new Response(
          JSON.stringify({
            success: false,
            error: "Nome da pessoa é obrigatório para envio via WhatsApp",
            message: "Campo 'userName' é obrigatório quando WhatsApp está incluído"
          }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (!whatsappNumber || whatsappNumber.trim() === '') {
        console.error(`❌ [INVITE-ORCHESTRATOR] Número WhatsApp obrigatório`);
        return new Response(
          JSON.stringify({
            success: false,
            error: "Número do WhatsApp é obrigatório",
            message: "Campo 'whatsappNumber' é obrigatório quando WhatsApp está incluído"
          }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    console.log(`📱 [INVITE-ORCHESTRATOR] Processando convite:`, {
      email,
      canais: channels.join(', '),
      userName: userName || 'N/A',
      whatsappNumber: whatsappNumber || 'N/A'
    });

    const results: any[] = [];
    let successfulChannels = 0;

    // Criar cliente Supabase para chamadas das functions
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://zotzvtepvpnkcoobdubt.supabase.co";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ";
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Processar cada canal
    for (const channel of channels) {
      try {
        if (channel === 'email') {
          console.log(`📧 [INVITE-ORCHESTRATOR] Enviando por e-mail...`);
          
          const emailResult = await supabase.functions.invoke('send-invite-email', {
            body: {
              inviteId,
              email,
              roleId,
              token,
              isResend,
              notes
            }
          });

          if (emailResult.error) {
            throw new Error(`Erro no e-mail: ${emailResult.error.message}`);
          }

          console.log(`✅ [INVITE-ORCHESTRATOR] E-mail enviado com sucesso`);
          results.push({ channel: 'email', success: true, data: emailResult.data });
          successfulChannels++;

        } else if (channel === 'whatsapp') {
          console.log(`📱 [INVITE-ORCHESTRATOR] Enviando por WhatsApp para: ${whatsappNumber}`);
          
          const whatsappResult = await supabase.functions.invoke('send-invite-whatsapp', {
            body: {
              inviteId,
              whatsappNumber,
              roleId,
              token,
              userName: userName!.trim(), // Já validamos que existe
              notes
            }
          });

          if (whatsappResult.error) {
            throw new Error(`Erro no WhatsApp: ${whatsappResult.error.message}`);
          }

          console.log(`✅ [INVITE-ORCHESTRATOR] WhatsApp enviado com sucesso`);
          results.push({ channel: 'whatsapp', success: true, data: whatsappResult.data });
          successfulChannels++;
        }

      } catch (error: any) {
        console.error(`❌ [INVITE-ORCHESTRATOR] Erro no canal ${channel}:`, error.message);
        results.push({ 
          channel, 
          success: false, 
          error: error.message || `Erro desconhecido no canal ${channel}` 
        });
      }
    }

    console.log(`🎯 [INVITE-ORCHESTRATOR] Resultado final:`, {
      totalCanais: channels.length,
      sucessos: successfulChannels,
      falhas: channels.length - successfulChannels,
      resultados: results.map(r => ({ canal: r.channel, sucesso: r.success }))
    });

    // Retornar resultado consolidado
    const overallSuccess = successfulChannels > 0;
    const channelNames = channels
      .filter((_, index) => results[index]?.success)
      .map(c => c === 'email' ? 'E-mail' : 'WhatsApp')
      .join(' e ');
    
    return new Response(
      JSON.stringify({
        success: overallSuccess,
        message: overallSuccess 
          ? `Convite enviado com sucesso via ${channelNames}`
          : "Falha ao enviar convite por todos os canais",
        summary: {
          totalChannels: channels.length,
          successfulChannels,
          failedChannels: channels.length - successfulChannels
        },
        results,
        inviteId,
        token
      }),
      {
        status: overallSuccess ? 200 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`❌ [INVITE-ORCHESTRATOR] Erro geral:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno do orquestrador",
        message: "Falha no processamento do convite"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

console.log("🎯 [INVITE-ORCHESTRATOR] Edge Function carregada! v4.2 Corrigido");
serve(handler);
