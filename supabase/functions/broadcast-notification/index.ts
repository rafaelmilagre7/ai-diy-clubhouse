import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts';

const BATCH_SIZE = 50;
const RATE_LIMIT_PER_MIN = 1000;

interface BroadcastRequest {
  title: string;
  message: string;
  type: string;
  category: string;
  priority?: number;
  action_url?: string;
  filters?: {
    roles?: string[];
    created_after?: string;
    status?: string;
  };
  metadata?: Record<string, any>;
  confirm: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Não autorizado');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Não autorizado');
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role_id, user_roles(name, permissions)')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.user_roles?.name === 'admin';
    if (!isAdmin) {
      throw new Error('Apenas administradores podem enviar broadcasts');
    }

    const body: BroadcastRequest = await req.json();

    // Validação de segurança
    if (!body.confirm) {
      throw new Error('Confirmação obrigatória. Adicione confirm: true');
    }

    // Validações
    if (!body.title || !body.message || !body.type || !body.category) {
      throw new Error('Campos obrigatórios: title, message, type, category');
    }

    console.log('[BROADCAST] 🚀 Iniciando broadcast:', {
      title: body.title,
      filters: body.filters,
      admin: user.email
    });

    const startTime = Date.now();

    // Buscar usuários elegíveis
    const { data: targetUsers, error: usersError } = await supabase
      .rpc('get_users_for_broadcast', {
        p_roles: body.filters?.roles || null,
        p_created_after: body.filters?.created_after || null,
        p_status: body.filters?.status || 'active'
      });

    if (usersError) throw usersError;

    const totalUsers = targetUsers?.length || 0;
    console.log(`[BROADCAST] 📊 Total de usuários: ${totalUsers}`);

    if (totalUsers === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Nenhum usuário elegível encontrado',
          stats: { total: 0, sent: 0, failed: 0 }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enviar em lotes
    let sent = 0;
    let failed = 0;
    const userIds = targetUsers.map((u: any) => u.user_id);

    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const batch = userIds.slice(i, i + BATCH_SIZE);
      
      const notifications = batch.map((userId: string) => ({
        user_id: userId,
        title: body.title,
        message: body.message,
        type: body.type,
        category: body.category,
        priority: body.priority || 3,
        action_url: body.action_url || null,
        metadata: body.metadata || {},
        is_read: false,
        created_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        console.error(`[BROADCAST] ❌ Erro no lote ${i}-${i + BATCH_SIZE}:`, insertError);
        failed += batch.length;
      } else {
        sent += batch.length;
        console.log(`[BROADCAST] ✅ Lote ${i}-${i + BATCH_SIZE} enviado (${sent}/${totalUsers})`);
      }

      // Rate limiting simples
      if (sent % RATE_LIMIT_PER_MIN === 0) {
        await new Promise(resolve => setTimeout(resolve, 60000));
      }
    }

    const duration = Date.now() - startTime;

    // Log de auditoria
    await supabase.rpc('log_broadcast_event', {
      p_admin_id: user.id,
      p_title: body.title,
      p_total_sent: sent,
      p_total_failed: failed,
      p_duration_ms: duration,
      p_filters: body.filters || {}
    });

    console.log(`[BROADCAST] 🎉 Concluído: ${sent} enviadas, ${failed} falhas em ${duration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Broadcast enviado com sucesso`,
        stats: {
          total: totalUsers,
          sent,
          failed,
          duration_ms: duration
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[BROADCAST] ❌ Erro:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
