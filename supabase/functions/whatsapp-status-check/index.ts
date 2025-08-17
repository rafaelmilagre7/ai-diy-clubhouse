import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppStatusResponse {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: Array<{
    code: number;
    title: string;
    message: string;
    error_data: {
      details: string;
    };
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const whatsappToken = Deno.env.get('WHATSAPP_API_KEY');

    if (!whatsappToken) {
      console.log('⚠️ [WHATSAPP-STATUS] Token WhatsApp não configurado');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'WhatsApp token não configurado' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🔍 [WHATSAPP-STATUS] Iniciando verificação de status...');

    // Buscar deliveries do WhatsApp que precisam de atualização (últimas 24h)
    const { data: deliveries, error: fetchError } = await supabase
      .from('invite_deliveries')
      .select('*')
      .eq('channel', 'whatsapp')
      .not('provider_id', 'is', null)
      .in('status', ['sent', 'pending'])
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(50);

    if (fetchError) {
      throw fetchError;
    }

    if (!deliveries || deliveries.length === 0) {
      console.log('ℹ️ [WHATSAPP-STATUS] Nenhuma mensagem para verificar');
      return new Response(JSON.stringify({ 
        success: true, 
        checked: 0,
        message: 'Nenhuma mensagem pendente para verificar' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📊 [WHATSAPP-STATUS] Verificando ${deliveries.length} mensagens...`);

    let updatedCount = 0;
    const results = [];

    for (const delivery of deliveries) {
      try {
        console.log(`🔍 [WHATSAPP-STATUS] Verificando message ID: ${delivery.provider_id}`);

        // Consultar status na API do WhatsApp
        const statusResponse = await fetch(
          `https://graph.facebook.com/v18.0/${delivery.provider_id}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${whatsappToken}`,
              'Content-Type': 'application/json',
            }
          }
        );

        if (!statusResponse.ok) {
          const errorData = await statusResponse.json();
          console.warn(`⚠️ [WHATSAPP-STATUS] Erro ao consultar ${delivery.provider_id}:`, errorData);
          
          // Se a mensagem não foi encontrada, marcar como failed
          if (statusResponse.status === 404) {
            await supabase
              .from('invite_deliveries')
              .update({
                status: 'failed',
                metadata: {
                  ...delivery.metadata,
                  whatsapp_status: 'not_found',
                  failed_at: new Date().toISOString(),
                  error: 'Message not found in WhatsApp API'
                },
                updated_at: new Date().toISOString()
              })
              .eq('id', delivery.id);
            
            updatedCount++;
            results.push({
              delivery_id: delivery.id,
              message_id: delivery.provider_id,
              status: 'failed',
              reason: 'not_found'
            });
          }
          continue;
        }

        const statusData: WhatsAppStatusResponse = await statusResponse.json();
        console.log(`📍 [WHATSAPP-STATUS] Status recebido para ${delivery.provider_id}:`, statusData);

        // Mapear status do WhatsApp para nosso sistema
        let newStatus = delivery.status;
        let whatsappStatus = 'sent';
        const updatedMetadata = { ...delivery.metadata };

        // A resposta pode conter informações de status na estrutura de mensagem
        // Como não temos webhook, o status básico será 'sent' se a API respondeu OK
        if (statusData.id) {
          // Se conseguimos buscar a mensagem, ela foi pelo menos enviada
          newStatus = 'sent';
          whatsappStatus = 'sent';
          updatedMetadata.whatsapp_status = 'sent';
          updatedMetadata.whatsapp_verified_at = new Date().toISOString();
          
          // Verificar se há erros na resposta
          if (statusData.errors && statusData.errors.length > 0) {
            newStatus = 'failed';
            whatsappStatus = 'failed';
            updatedMetadata.whatsapp_status = 'failed';
            updatedMetadata.whatsapp_error = statusData.errors[0];
            updatedMetadata.failed_at = new Date().toISOString();
          }
        }

        // Atualizar apenas se o status mudou
        if (newStatus !== delivery.status || !updatedMetadata.whatsapp_verified_at) {
          const { error: updateError } = await supabase
            .from('invite_deliveries')
            .update({
              status: newStatus,
              metadata: updatedMetadata,
              updated_at: new Date().toISOString()
            })
            .eq('id', delivery.id);

          if (updateError) {
            console.error(`❌ [WHATSAPP-STATUS] Erro ao atualizar delivery ${delivery.id}:`, updateError);
          } else {
            updatedCount++;
            console.log(`✅ [WHATSAPP-STATUS] Atualizado: ${delivery.provider_id} -> ${newStatus}`);
          }
        }

        results.push({
          delivery_id: delivery.id,
          message_id: delivery.provider_id,
          status: newStatus,
          whatsapp_status: whatsappStatus,
          verified: true
        });

        // Pequeno delay para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (messageError: any) {
        console.error(`❌ [WHATSAPP-STATUS] Erro ao processar message ${delivery.provider_id}:`, messageError);
        results.push({
          delivery_id: delivery.id,
          message_id: delivery.provider_id,
          error: messageError.message,
          verified: false
        });
      }
    }

    console.log(`✅ [WHATSAPP-STATUS] Verificação concluída: ${updatedCount}/${deliveries.length} atualizados`);

    return new Response(JSON.stringify({
      success: true,
      checked: deliveries.length,
      updated: updatedCount,
      results: results,
      message: `Verificados ${deliveries.length} mensagens, ${updatedCount} atualizadas`
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ [WHATSAPP-STATUS] Erro geral:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});