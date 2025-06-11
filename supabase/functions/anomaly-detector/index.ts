
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Análise de padrões suspeitos nas últimas 24h
    const analyzeTimeframe = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    // 1. Detectar múltiplos logins falhados
    const { data: failedLogins } = await supabaseClient
      .from('security_logs')
      .select('user_id, ip_address, COUNT(*)')
      .eq('event_type', 'auth')
      .eq('action', 'login_failure')
      .gte('timestamp', analyzeTimeframe)
      .group('user_id, ip_address')
      .having('COUNT(*) > 5')

    // 2. Detectar acessos de IPs incomuns
    const { data: unusualIps } = await supabaseClient
      .from('security_logs')
      .select('user_id, ip_address, COUNT(*)')
      .eq('event_type', 'auth')
      .eq('action', 'login_success')
      .gte('timestamp', analyzeTimeframe)
      .group('user_id, ip_address')

    // 3. Detectar atividade fora do horário usual
    const { data: offHoursActivity } = await supabaseClient
      .from('security_logs')
      .select('user_id, timestamp')
      .gte('timestamp', analyzeTimeframe)
      .order('timestamp', { ascending: false })

    const anomalies = []

    // Processar logins falhados
    if (failedLogins) {
      for (const failed of failedLogins) {
        anomalies.push({
          anomaly_type: 'excessive_failed_logins',
          confidence_score: Math.min(0.9, failed.count / 10),
          description: `${failed.count} tentativas de login falhadas em 24h`,
          affected_user_id: failed.user_id,
          detection_data: {
            ip_address: failed.ip_address,
            failed_attempts: failed.count,
            timeframe: '24h'
          }
        })
      }
    }

    // Processar atividade fora de horário (assumindo horário comercial 8-18h)
    if (offHoursActivity) {
      const offHoursUsers = offHoursActivity.filter(activity => {
        const hour = new Date(activity.timestamp).getHours()
        return hour < 8 || hour > 18
      })

      const userOffHoursCounts = {}
      offHoursUsers.forEach(activity => {
        userOffHoursCounts[activity.user_id] = (userOffHoursCounts[activity.user_id] || 0) + 1
      })

      Object.entries(userOffHoursCounts).forEach(([userId, count]) => {
        if (count > 10) {
          anomalies.push({
            anomaly_type: 'off_hours_activity',
            confidence_score: Math.min(0.7, count / 20),
            description: `${count} atividades fora do horário comercial em 24h`,
            affected_user_id: userId,
            detection_data: {
              off_hours_count: count,
              timeframe: '24h'
            }
          })
        }
      })
    }

    // Inserir anomalias detectadas
    if (anomalies.length > 0) {
      const { error } = await supabaseClient
        .from('security_anomalies')
        .insert(anomalies)

      if (error) {
        console.error('Error inserting anomalies:', error)
      }
    }

    // Gerar métricas de segurança
    await supabaseClient.rpc('generate_security_metrics')

    return new Response(
      JSON.stringify({ 
        success: true, 
        anomalies_detected: anomalies.length,
        metrics_updated: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Anomaly detector error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
