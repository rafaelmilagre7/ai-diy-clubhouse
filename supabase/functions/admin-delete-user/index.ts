
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteUserRequest {
  userEmail: string;
  forceDelete?: boolean;
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
  console.log(`🚀 [ADMIN-DELETE-USER] Requisição recebida: ${req.method}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar se é uma requisição POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse do body da requisição
    const { userEmail, forceDelete = false }: DeleteUserRequest = await req.json();
    
    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: 'Email do usuário é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`📧 [ADMIN-DELETE-USER] Processando limpeza para: ${userEmail}`);

    // Inicializar cliente Supabase com service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const result: DeleteUserResponse = {
      success: false,
      message: '',
      details: {
        tablesAffected: [],
        backupRecords: 0,
        authUserDeleted: false,
        errors: []
      }
    };

    // FASE 1: Executar limpeza completa via função SQL
    console.log(`🧹 [ADMIN-DELETE-USER] Executando limpeza completa dos dados públicos`);
    
    const { data: cleanupData, error: cleanupError } = await supabaseAdmin.rpc(
      'admin_complete_user_cleanup',
      { user_email: userEmail }
    );

    if (cleanupError) {
      console.error(`❌ [ADMIN-DELETE-USER] Erro na limpeza dos dados:`, cleanupError);
      result.details.errors.push({
        operation: 'cleanup_public_data',
        error: cleanupError.message
      });
    } else if (cleanupData?.success) {
      console.log(`✅ [ADMIN-DELETE-USER] Limpeza dos dados públicos concluída:`, cleanupData);
      result.details.backupRecords = cleanupData.backup_records || 0;
      result.details.tablesAffected = [
        'profiles', 'user_onboarding', 'onboarding_sync', 'onboarding_final',
        'implementation_trails', 'analytics', 'notifications', 'progress',
        'learning_progress', 'forum_posts', 'forum_topics', 'solution_comments'
      ];
    }

    // FASE 2: Excluir usuário da auth.users (se forceDelete = true)
    if (forceDelete) {
      console.log(`🗑️ [ADMIN-DELETE-USER] Executando exclusão do auth.users`);
      
      // Buscar o ID do usuário primeiro
      const { data: userData, error: userError } = await supabaseAdmin
        .from('auth.users')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (userError) {
        console.error(`❌ [ADMIN-DELETE-USER] Erro ao buscar usuário:`, userError);
        result.details.errors.push({
          operation: 'find_auth_user',
          error: userError.message
        });
      } else if (userData?.id) {
        // Excluir usuário da auth.users usando Admin API
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userData.id);
        
        if (deleteError) {
          console.error(`❌ [ADMIN-DELETE-USER] Erro ao excluir auth user:`, deleteError);
          result.details.errors.push({
            operation: 'delete_auth_user',
            error: deleteError.message
          });
        } else {
          console.log(`✅ [ADMIN-DELETE-USER] Usuário removido da auth.users com sucesso`);
          result.details.authUserDeleted = true;
        }
      }
    }

    // FASE 3: Determinar resultado final
    const hasErrors = result.details.errors.length > 0;
    const authDeletionSuccess = forceDelete ? result.details.authUserDeleted : true;
    
    result.success = !hasErrors && authDeletionSuccess;
    
    if (result.success) {
      result.message = forceDelete 
        ? `Usuário ${userEmail} completamente removido do sistema`
        : `Dados públicos do usuário ${userEmail} limpos com sucesso`;
    } else {
      result.message = `Limpeza parcial realizada com ${result.details.errors.length} erro(s)`;
    }

    console.log(`📊 [ADMIN-DELETE-USER] Resultado final:`, result);

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 207, // 207 = Multi-Status (partial success)
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error(`💥 [ADMIN-DELETE-USER] Erro inesperado:`, error);
    
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
