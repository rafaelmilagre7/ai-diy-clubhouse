import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'GET') {
      // Verificação de webhook do Meta
      const url = new URL(req.url)
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')

      console.log('🔍 [WEBHOOK-VERIFICATION] Verificando webhook:', { mode, token, challenge })

      const VERIFY_TOKEN = Deno.env.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN') || 'lovable_webhook_token'

      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ [WEBHOOK-VERIFICATION] Webhook verificado com sucesso')
        return new Response(challenge, { status: 200 })
      } else {
        console.error('❌ [WEBHOOK-VERIFICATION] Token inválido')
        return new Response('Forbidden', { status: 403 })
      }
    }

    if (req.method === 'POST') {
      const webhookData = await req.json()
      
      console.log('📱 [WEBHOOK-RECEIVED] Dados recebidos:', {
        timestamp: new Date().toISOString(),
        data: JSON.stringify(webhookData, null, 2)
      })

      // Processar mudanças de status das mensagens
      if (webhookData.entry) {
        for (const entry of webhookData.entry) {
          if (entry.changes) {
            for (const change of entry.changes) {
              if (change.field === 'messages' && change.value.statuses) {
                for (const status of change.value.statuses) {
                  console.log('📱 [STATUS-UPDATE] Atualizando status:', {
                    messageId: status.id,
                    status: status.status,
                    timestamp: status.timestamp,
                    recipientId: status.recipient_id,
                    errors: status.errors
                  })

                  // Atualizar tabela invite_deliveries
                  const { error } = await supabase
                    .from('invite_deliveries')
                    .update({
                      status: status.status,
                      delivered_at: status.status === 'delivered' ? new Date().toISOString() : null,
                      failed_at: status.status === 'failed' ? new Date().toISOString() : null,
                      error_message: status.errors ? JSON.stringify(status.errors) : null,
                      metadata: {
                        ...{},
                        webhook_status: status.status,
                        webhook_timestamp: status.timestamp,
                        errors: status.errors
                      }
                    })
                    .eq('provider_id', status.id)

                  if (error) {
                    console.error('❌ [DB-UPDATE] Erro ao atualizar delivery:', error)
                  } else {
                    console.log('✅ [DB-UPDATE] Status atualizado no banco')
                  }

                  // Log de auditoria
                  await supabase.from('audit_logs').insert({
                    event_type: 'whatsapp_status_update',
                    action: 'webhook_status_received',
                    details: {
                      message_id: status.id,
                      status: status.status,
                      recipient_id: status.recipient_id,
                      timestamp: status.timestamp,
                      errors: status.errors
                    },
                    severity: status.status === 'failed' ? 'high' : 'info'
                  })
                }
              }
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response('Method not allowed', { status: 405 })

  } catch (error) {
    console.error('❌ [WEBHOOK] Erro:', error)

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})