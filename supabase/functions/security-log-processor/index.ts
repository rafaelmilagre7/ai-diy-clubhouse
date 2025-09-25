
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
    // VALIDAÇÃO DE SEGURANÇA CRÍTICA: Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("SECURITY VIOLATION: Tentativa de processar logs sem autenticação");
      return new Response(
        JSON.stringify({ error: 'Token de autenticação obrigatório' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Validar token e verificar se usuário é admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("SECURITY VIOLATION: Token inválido na função de logs", authError);
      return new Response(
        JSON.stringify({ error: 'Token de autenticação inválido' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Verificar se o usuário é admin
    const { data: adminValidation } = await supabaseClient.rpc('validate_admin_access', {
      user_id: user.id
    });

    if (!adminValidation?.is_admin) {
      console.error("SECURITY VIOLATION: Usuário não-admin tentando processar logs", {
        userId: user.id,
        userRole: adminValidation?.user_role
      });
      
      return new Response(
        JSON.stringify({ error: 'Acesso negado: privilégios de administrador obrigatórios' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      )
    }

    const { logs } = await req.json()

    if (!logs || !Array.isArray(logs)) {
      throw new Error('Invalid logs format')
    }

    // Processar cada log
    const processedLogs = logs.map(log => ({
      user_id: log.userId || null,
      event_type: log.eventType || 'system',
      severity: log.severity || 'low',
      action: log.action,
      resource_type: log.resourceType || null,
      resource_id: log.resourceId || null,
      details: log.details || {},
      ip_address: log.ipAddress || null,
      user_agent: log.userAgent || null,
      location: log.location || null,
      correlation_id: log.correlationId || null
    }))

    // Inserir logs em lote
    const { error } = await supabaseClient
      .from('security_logs')
      .insert(processedLogs)

    if (error) {
      console.error('Error inserting security logs:', error)
      throw error
    }

    // Verificar se há padrões suspeitos
    for (const log of processedLogs) {
      if (log.event_type === 'auth' && log.action === 'login_success' && log.user_id) {
        await supabaseClient.rpc('detect_login_anomaly', {
          p_user_id: log.user_id,
          p_ip_address: log.ip_address
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: processedLogs.length }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Security log processor error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
