
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteUserRequest {
  userId?: string;
  userEmail?: string;
  forceDelete?: boolean;
  softDelete?: boolean;
}

interface DeleteUserResponse {
  success: boolean;
  message: string;
  details: {
    tablesAffected: string[];
    backupRecords: number;
    authUserDeleted: boolean;
    errors: any[];
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar se é uma requisição POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Criar cliente Supabase com service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verificar autenticação do usuário que está fazendo a requisição
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar se o usuário é admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar se o usuário é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        id,
        user_roles:role_id!inner(name)
      `)
      .eq('id', user.id)
      .single();

    if (!profile || profile.user_roles?.name !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse do body da requisição
    const body: DeleteUserRequest = await req.json();
    const { userId, userEmail, forceDelete = false } = body;

    if (!userId && !userEmail) {
      return new Response(
        JSON.stringify({ error: 'userId or userEmail is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`🗑️ [ADMIN-DELETE-USER] Iniciando exclusão completa para: ${userEmail || userId}`);

    const response: DeleteUserResponse = {
      success: false,
      message: '',
      details: {
        tablesAffected: [],
        backupRecords: 0,
        authUserDeleted: false,
        errors: []
      }
    };

    let targetUserId = userId;

    // Se foi fornecido email, buscar o userId
    if (userEmail && !userId) {
      const { data: authUser, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error('❌ Erro ao buscar usuários:', userError);
        response.details.errors.push({ operation: 'list_users', error: userError.message });
      } else {
        const foundUser = authUser.users.find(u => u.email === userEmail);
        if (foundUser) {
          targetUserId = foundUser.id;
          console.log(`👤 Usuário encontrado: ${foundUser.id}`);
        } else {
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: `Usuário não encontrado com email: ${userEmail}` 
            }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }
    }

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Não foi possível determinar o ID do usuário' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // FASE 1: Limpeza dos dados públicos usando a nova função SQL
    console.log('🧹 Executando limpeza completa dos dados públicos...');
    const { data: cleanupResult, error: cleanupError } = await supabase.rpc(
      'admin_complete_user_cleanup', 
      { user_email: userEmail || '' }
    );

    if (cleanupError) {
      console.error('❌ Erro na limpeza de dados públicos:', cleanupError);
      response.details.errors.push({ operation: 'public_cleanup', error: cleanupError.message });
    } else if (cleanupResult?.success) {
      console.log('✅ Dados públicos limpos com sucesso');
      response.details.backupRecords = cleanupResult.backup_records || 0;
      response.details.tablesAffected.push('profiles', 'onboarding_sync', 'user_onboarding', 'implementation_trails', 'analytics', 'notifications');
    }

    // FASE 2: Exclusão do usuário da auth.users
    if (forceDelete) {
      console.log('🗑️ Removendo usuário da auth.users...');
      const { data: deleteData, error: deleteError } = await supabase.auth.admin.deleteUser(targetUserId);
      
      if (deleteError) {
        console.error('❌ Erro ao deletar usuário da auth:', deleteError);
        response.details.errors.push({ operation: 'auth_delete', error: deleteError.message });
      } else {
        console.log('✅ Usuário removido da auth.users');
        response.details.authUserDeleted = true;
        response.details.tablesAffected.push('auth.users');
      }
    }

    // FASE 3: Limpeza final de convites
    console.log('📧 Limpando convites relacionados...');
    const { error: inviteError } = await supabase
      .from('invites')
      .delete()
      .eq('email', userEmail || '');

    if (inviteError) {
      console.warn('⚠️ Erro ao limpar convites:', inviteError);
      response.details.errors.push({ operation: 'cleanup_invites', error: inviteError.message });
    } else {
      response.details.tablesAffected.push('invites');
    }

    // Determinar sucesso geral
    const hasErrors = response.details.errors.length > 0;
    const authDeleted = forceDelete ? response.details.authUserDeleted : true; // Se não forçou delete, considera sucesso

    response.success = !hasErrors && authDeleted;
    response.message = response.success 
      ? `✅ Usuário ${userEmail || targetUserId} completamente removido do sistema`
      : `⚠️ Limpeza parcial concluída com ${response.details.errors.length} erro(s)`;

    console.log('📊 Resultado final:', response);

    return new Response(
      JSON.stringify(response),
      { 
        status: response.success ? 200 : 207, // 207 = Multi-Status para sucesso parcial
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro inesperado na Edge Function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Erro inesperado: ${error.message}`,
        details: {
          tablesAffected: [],
          backupRecords: 0,
          authUserDeleted: false,
          errors: [{ operation: 'unexpected_error', error: error.message }]
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
