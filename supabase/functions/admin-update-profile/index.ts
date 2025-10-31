import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { getSecureCorsHeaders, isOriginAllowed, forbiddenOriginResponse } from '../_shared/secureCors.ts'

Deno.serve(async (req) => {
  const corsHeaders = getSecureCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // 🔒 VALIDAÇÃO CORS: Bloquear origens não confiáveis
  if (!isOriginAllowed(req)) {
    console.warn('[SECURITY] Origem não autorizada bloqueada:', req.headers.get('origin'));
    return forbiddenOriginResponse();
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Não autenticado')
    }

    // Verificar autenticação
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      console.error('[ADMIN-UPDATE-PROFILE] Auth error:', authError)
      throw new Error('Usuário não autenticado')
    }

    console.log('[ADMIN-UPDATE-PROFILE] User authenticated:', user.id)

    // Verificar se é admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select(`
        role_id,
        user_roles:role_id (
          name
        )
      `)
      .eq('id', user.id)
      .single()

    const userRoles = profile?.user_roles as any
    const isAdmin = userRoles?.name === 'admin'
    
    if (!isAdmin) {
      console.error('[ADMIN-UPDATE-PROFILE] Access denied for user:', user.id)
      throw new Error('Acesso negado - apenas administradores')
    }

    console.log('[ADMIN-UPDATE-PROFILE] Admin verified')

    // Parse do body
    const { targetUserId, updates } = await req.json()

    if (!targetUserId || !updates) {
      throw new Error('targetUserId e updates são obrigatórios')
    }

    console.log('[ADMIN-UPDATE-PROFILE] Updating profile:', targetUserId, 'Fields:', Object.keys(updates))

    // Usar service_role para bypass RLS (com validação admin acima)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Atualizar perfil
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId)
      .select()
      .single()

    if (error) {
      console.error('[ADMIN-UPDATE-PROFILE] Update error:', error)
      throw new Error(`Erro ao atualizar: ${error.message}`)
    }

    console.log('[ADMIN-UPDATE-PROFILE] Profile updated successfully')

    // Auditoria
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      event_type: 'admin_profile_update',
      action: 'profile_updated_by_admin',
      details: {
        admin_email: user.email,
        target_user_id: targetUserId,
        fields_updated: Object.keys(updates),
        timestamp: new Date().toISOString()
      },
      severity: 'info'
    })

    console.log('[ADMIN-UPDATE-PROFILE] Audit log created')

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[ADMIN-UPDATE-PROFILE] Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
