import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Edge Function para processar fila de emails de notificações
 * Deve ser chamada por um cron job ou trigger
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    console.log('📬 [PROCESS-EMAILS] Iniciando processamento...')

    // Buscar notificações que precisam ser enviadas por email
    // Critérios:
    // 1. Status = 'unread' ou 'sent' (notificações novas)
    // 2. Ainda não foram enviadas por email (não existe registro em notification_delivery)
    // 3. Criadas nos últimos 5 minutos (para evitar enviar notificações antigas)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select(`
        id,
        user_id,
        category,
        type,
        title,
        message,
        metadata,
        created_at
      `)
      .gte('created_at', fiveMinutesAgo)
      .in('status', ['unread', 'sent'])
      .order('created_at', { ascending: true })
      .limit(50) // Processar 50 por vez

    if (notifError) {
      throw notifError
    }

    console.log(`📊 [PROCESS-EMAILS] ${notifications?.length || 0} notificações encontradas`)

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'Nenhuma notificação para processar' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Filtrar notificações que ainda não foram enviadas por email
    const notificationsToSend = []
    
    for (const notif of notifications) {
      const { data: delivery } = await supabase
        .from('notification_delivery')
        .select('id')
        .eq('notification_id', notif.id)
        .eq('channel', 'email')
        .maybeSingle()

      if (!delivery) {
        notificationsToSend.push(notif)
      }
    }

    console.log(`📤 [PROCESS-EMAILS] ${notificationsToSend.length} notificações para enviar`)

    // Enviar emails
    const results = await Promise.allSettled(
      notificationsToSend.map(async (notif) => {
        try {
          const { data, error } = await supabase.functions.invoke('send-notification-email', {
            body: {
              notificationId: notif.id,
              userId: notif.user_id,
              category: notif.category,
              type: notif.type,
              title: notif.title,
              message: notif.message,
              metadata: notif.metadata,
            },
          })

          if (error) throw error
          
          console.log(`✅ [PROCESS-EMAILS] Email enviado para notificação ${notif.id}`)
          return { success: true, notificationId: notif.id }
        } catch (error: any) {
          console.error(`❌ [PROCESS-EMAILS] Erro ao enviar email para ${notif.id}:`, error)
          
          // Registrar falha
          await supabase
            .from('notification_delivery')
            .insert({
              notification_id: notif.id,
              channel: 'email',
              status: 'failed',
              error_message: error.message,
              metadata: { error: error.toString() },
            })
          
          return { success: false, notificationId: notif.id, error: error.message }
        }
      })
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    console.log(`📊 [PROCESS-EMAILS] Concluído: ${successful} sucesso, ${failed} falhas`)

    return new Response(
      JSON.stringify({
        success: true,
        processed: notificationsToSend.length,
        successful,
        failed,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('❌ [PROCESS-EMAILS] Erro crítico:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
