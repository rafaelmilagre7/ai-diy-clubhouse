import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"

// FASE 4: Schema de validação com Zod
const securityLogSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  eventType: z.enum(['auth', 'system', 'admin', 'data', 'security']).default('system'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
  action: z.string().min(1).max(200),
  resourceType: z.string().max(50).optional().nullable(),
  resourceId: z.string().max(100).optional().nullable(),
  details: z.record(z.unknown()).optional().nullable(),
  ipAddress: z.string().max(45).optional().nullable(),
  userAgent: z.string().max(500).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  correlationId: z.string().uuid().optional().nullable()
});

const logsArraySchema = z.array(securityLogSchema).max(100);
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

    // FASE 4: Rate limiting - verificar quantos logs foram enviados recentemente
    const { count: recentLogsCount } = await supabaseClient
      .from('security_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 60000).toISOString());

    if (recentLogsCount && recentLogsCount > 1000) {
      console.warn('[SECURITY] Rate limit exceeded:', {
        userId: user.id,
        logsInLastMinute: recentLogsCount
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Muitas requisições. Aguarde 1 minuto e tente novamente.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429 
        }
      );
    }

    const { logs } = await req.json()

    // FASE 4: Validação de input com Zod
    let validatedLogs;
    try {
      validatedLogs = logsArraySchema.parse(logs);
    } catch (error) {
      console.error('[SECURITY] Invalid log format:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Formato de log inválido',
          details: error instanceof z.ZodError ? error.errors : 'Formato não reconhecido'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // FASE 4: Sanitizar details para prevenir objetos muito grandes
    const sanitizeDetails = (details: any): any => {
      if (!details) return null;
      if (typeof details === 'string') {
        return details.substring(0, 10000);
      }
      if (Array.isArray(details)) {
        return details.slice(0, 100).map(sanitizeDetails);
      }
      if (typeof details === 'object') {
        const sanitized: any = {};
        Object.keys(details).slice(0, 50).forEach(key => {
          sanitized[key] = sanitizeDetails(details[key]);
        });
        return sanitized;
      }
      return details;
    };

    // Processar cada log validado
    const processedLogs = validatedLogs.map(log => ({
      user_id: log.userId || null,
      event_type: log.eventType || 'system',
      severity: log.severity || 'low',
      action: log.action,
      resource_type: log.resourceType || null,
      resource_id: log.resourceId || null,
      details: sanitizeDetails(log.details) || {},
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
