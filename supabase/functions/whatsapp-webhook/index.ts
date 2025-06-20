
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface WhatsAppWebhookData {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
          conversation?: {
            id: string;
            expiration_timestamp?: string;
            origin: {
              type: string;
            };
          };
          pricing?: {
            billable: boolean;
            pricing_model: string;
            category: string;
          };
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: {
            body: string;
          };
          type: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  console.log(`📱 [WHATSAPP-WEBHOOK] Nova requisição: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  
  // Verificação do webhook (GET request)
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    
    const verifyToken = Deno.env.get("WHATSAPP_WEBHOOK_TOKEN");
    
    console.log(`🔍 [WHATSAPP-WEBHOOK] Verificação: mode=${mode}, token=${token ? 'present' : 'missing'}`);
    
    if (mode === "subscribe" && token === verifyToken) {
      console.log("✅ [WHATSAPP-WEBHOOK] Webhook verificado com sucesso");
      return new Response(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain", ...corsHeaders }
      });
    } else {
      console.error("❌ [WHATSAPP-WEBHOOK] Falha na verificação do webhook");
      return new Response("Forbidden", {
        status: 403,
        headers: { "Content-Type": "text/plain", ...corsHeaders }
      });
    }
  }

  // Processamento de webhook (POST request)
  if (req.method === "POST") {
    try {
      const webhookData: WhatsAppWebhookData = await req.json();
      
      console.log(`📱 [WHATSAPP-WEBHOOK] Dados recebidos:`, JSON.stringify(webhookData, null, 2));

      // Inicializar cliente Supabase
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Processar status de mensagens
      for (const entry of webhookData.entry || []) {
        for (const change of entry.changes || []) {
          const { value } = change;
          
          // Processar status de entrega
          if (value.statuses) {
            for (const status of value.statuses) {
              console.log(`📊 [WHATSAPP-WEBHOOK] Processando status: ${status.status} para mensagem ${status.id}`);
              
              try {
                // Mapear status do WhatsApp para nosso sistema
                let mappedStatus = status.status;
                switch (status.status) {
                  case 'sent':
                    mappedStatus = 'sent';
                    break;
                  case 'delivered':
                    mappedStatus = 'delivered';
                    break;
                  case 'read':
                    mappedStatus = 'opened';
                    break;
                  case 'failed':
                    mappedStatus = 'failed';
                    break;
                  default:
                    mappedStatus = status.status;
                }

                // Buscar a entrega correspondente pelo provider_id
                const { data: delivery, error: findError } = await supabase
                  .from('invite_deliveries')
                  .select('id, invite_id')
                  .eq('provider_id', status.id)
                  .eq('channel', 'whatsapp')
                  .single();

                if (findError) {
                  console.warn(`⚠️ [WHATSAPP-WEBHOOK] Entrega não encontrada para mensagem ${status.id}`);
                  continue;
                }

                // Atualizar status usando a função RPC
                const { error: updateError } = await supabase.rpc('log_invite_delivery', {
                  p_invite_id: delivery.invite_id,
                  p_channel: 'whatsapp',
                  p_status: mappedStatus,
                  p_provider_id: status.id,
                  p_metadata: {
                    webhook_timestamp: status.timestamp,
                    conversation_id: status.conversation?.id,
                    billable: status.pricing?.billable,
                    category: status.pricing?.category,
                    updated_via_webhook: true
                  }
                });

                if (updateError) {
                  console.error(`❌ [WHATSAPP-WEBHOOK] Erro ao atualizar status:`, updateError);
                } else {
                  console.log(`✅ [WHATSAPP-WEBHOOK] Status atualizado: ${mappedStatus} para convite ${delivery.invite_id}`);
                }

              } catch (statusError: any) {
                console.error(`❌ [WHATSAPP-WEBHOOK] Erro ao processar status:`, statusError);
              }
            }
          }

          // Processar mensagens recebidas (opcional - para logs)
          if (value.messages) {
            for (const message of value.messages) {
              console.log(`📨 [WHATSAPP-WEBHOOK] Mensagem recebida de ${message.from}: ${message.text?.body || 'N/A'}`);
              
              // Aqui podemos implementar lógica para respostas automáticas
              // ou logs de interações futuras
            }
          }
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Webhook processado com sucesso",
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );

    } catch (error: any) {
      console.error(`❌ [WHATSAPP-WEBHOOK] Erro ao processar webhook:`, error);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || "Erro interno do servidor"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }
  }

  return new Response("Method not allowed", {
    status: 405,
    headers: { "Content-Type": "text/plain", ...corsHeaders }
  });
};

console.log("📱 [WHATSAPP-WEBHOOK] Edge Function carregada!");
serve(handler);
