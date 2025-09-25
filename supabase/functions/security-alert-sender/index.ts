
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

    // Buscar anomalias críticas não processadas
    const { data: criticalAnomalies } = await supabaseClient
      .from('security_anomalies')
      .select('*')
      .eq('status', 'detected')
      .gte('confidence_score', 0.8)
      .gte('detected_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Última hora

    if (!criticalAnomalies || criticalAnomalies.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No critical anomalies to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar admins para notificar
    const { data: admins } = await supabaseClient
      .from('profiles')
      .select('id, email, name')
      .eq('role', 'admin')

    // Criar incidentes de segurança para anomalias críticas
    const incidents = criticalAnomalies.map(anomaly => ({
      title: `Anomalia Crítica: ${anomaly.anomaly_type}`,
      description: `${anomaly.description}\nConfiança: ${(anomaly.confidence_score * 100).toFixed(1)}%`,
      severity: anomaly.confidence_score > 0.9 ? 'critical' : 'high',
      created_by: null, // Sistema
      related_logs: [],
      metadata: {
        anomaly_id: anomaly.id,
        auto_generated: true,
        detection_data: anomaly.detection_data
      }
    }))

    if (incidents.length > 0) {
      const { error } = await supabaseClient
        .from('security_incidents')
        .insert(incidents)

      if (error) {
        console.error('Error creating incidents:', error)
        throw error
      }
    }

    // Criar notificações para admins
    if (admins && admins.length > 0) {
      const notifications = []
      
      for (const admin of admins) {
        for (const anomaly of criticalAnomalies) {
          notifications.push({
            user_id: admin.id,
            type: 'security_alert',
            title: 'Alerta de Segurança Crítico',
            message: `Anomalia detectada: ${anomaly.description}`,
            data: {
              anomaly_id: anomaly.id,
              severity: anomaly.confidence_score > 0.9 ? 'critical' : 'high',
              requires_action: true
            }
          })
        }
      }

      if (notifications.length > 0) {
        await supabaseClient
          .from('notifications')
          .insert(notifications)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        incidents_created: incidents.length,
        notifications_sent: (admins?.length || 0) * criticalAnomalies.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Security alert sender error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
