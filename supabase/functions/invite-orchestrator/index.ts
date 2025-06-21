
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
  console.log(`🎯 [INVITE-ORCHESTRATOR] Nova requisição: ${req.method} - v4.1 URL Corrigida`);
  
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
    }: InviteOrchestratorRequest = await req.json();

    console.log(`📧 [INVITE-ORCHESTRATOR] Processando convite para: ${email}, Canais: ${channels.join(', ')}, Nome: ${userName || 'N/A'}`);

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

          console.log(`✅ [INVITE-ORCHESTRATOR] E-mail enviado`);
          results.push({ channel: 'email', success: true, data: emailResult.data });
          successfulChannels++;

        } else if (channel === 'whatsapp') {
          console.log(`📱 [INVITE-ORCHESTRATOR] Enviando por WhatsApp...`);
          
          // Validar se userName foi fornecido para WhatsApp
          if (!userName || userName.trim() === '') {
            throw new Error("Nome do usuário é obrigatório para envio via WhatsApp");
          }

          if (!whatsappNumber || whatsappNumber.trim() === '') {
            throw new Error("Número do WhatsApp é obrigatório");
          }

          const whatsappResult = await supabase.functions.invoke('send-invite-whatsapp', {
            body: {
              inviteId,
              whatsappNumber,
              roleId,
              token,
              userName: userName.trim(),
              notes
            }
          });

          if (whatsappResult.error) {
            throw new Error(`Erro no WhatsApp: ${whatsappResult.error.message}`);
          }

          console.log(`✅ [INVITE-ORCHESTRATOR] WhatsApp enviado`);
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

    console.log(`🎯 [INVITE-ORCHESTRATOR] Resultado final: ${successfulChannels}/${channels.length} canais bem-sucedidos`);

    // Retornar resultado consolidado
    const overallSuccess = successfulChannels > 0;
    
    return new Response(
      JSON.stringify({
        success: overallSuccess,
        message: overallSuccess 
          ? `Convite enviado com sucesso via ${successfulChannels} canal(is)`
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

console.log("🎯 [INVITE-ORCHESTRATOR] Edge Function carregada com URL corrigida! v4.1");
serve(handler);
