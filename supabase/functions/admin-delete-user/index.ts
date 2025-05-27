
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteUserRequest {
  userId: string;
  forceDelete?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🗑️ Iniciando processo de exclusão completa de usuário");

    // Verificar autenticação do solicitante
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Cabeçalho de autorização não fornecido');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    );
    
    // Autenticar usuário atual
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error("❌ Erro de autenticação:", authError);
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("✅ Usuário autenticado:", user.email);

    // Verificar se o usuário é admin
    const { data: hasPermission, error: permError } = await supabaseClient.rpc(
      'user_has_permission',
      { user_id: user.id, permission_code: 'users.delete' }
    );
    
    if (permError || !hasPermission) {
      console.error("❌ Erro de permissão:", permError);
      return new Response(
        JSON.stringify({ error: 'Permissão negada - apenas administradores podem excluir usuários' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("✅ Permissões verificadas");

    // Obter dados da requisição
    const { userId, forceDelete = false }: DeleteUserRequest = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'ID do usuário não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("🎯 Iniciando exclusão do usuário:", userId);

    // Criar cliente administrativo com service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Buscar dados do usuário antes da exclusão (para logs)
    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('email, name')
      .eq('id', userId)
      .single();

    const userEmail = profileData?.email || 'email não encontrado';
    const userName = profileData?.name || 'nome não encontrado';

    console.log("📋 Dados do usuário a ser excluído:", { email: userEmail, name: userName });

    // FASE 1: Limpeza completa de dados relacionados
    console.log("🧹 Iniciando limpeza de dados relacionados...");

    const tables = [
      'analytics',
      'onboarding_progress',
      'onboarding_history', 
      'onboarding_ai_conversations',
      'onboarding_chat_messages',
      'onboarding_complementary_info',
      'implementation_trails',
      'invites',
      'direct_messages',
      'member_connections',
      'network_connections',
      'network_matches',
      'notifications',
      'forum_posts',
      'forum_topics',
      'forum_notifications',
      'learning_progress',
      'learning_comments',
      'progress',
      'user_checklists',
      'benefit_clicks',
      'solution_comments',
      'tool_comments',
      'referrals',
      'suggestion_votes',
      'suggestion_comments',
      'whatsapp_messages'
    ];

    const deletionResults = [];

    for (const table of tables) {
      try {
        console.log(`🗑️ Limpando tabela: ${table}`);
        
        let query = supabaseAdmin.from(table);
        
        // Algumas tabelas têm campos diferentes para user_id
        if (table === 'direct_messages') {
          const { error: senderError } = await query.delete().eq('sender_id', userId);
          const { error: recipientError } = await query.delete().eq('recipient_id', userId);
          
          if (senderError || recipientError) {
            console.warn(`⚠️ Erro parcial ao limpar ${table}:`, { senderError, recipientError });
          }
        } else if (table === 'member_connections' || table === 'network_connections') {
          const { error: requesterError } = await query.delete().eq('requester_id', userId);
          const { error: recipientError } = await query.delete().eq('recipient_id', userId);
          
          if (requesterError || recipientError) {
            console.warn(`⚠️ Erro parcial ao limpar ${table}:`, { requesterError, recipientError });
          }
        } else if (table === 'network_matches') {
          const { error: userError } = await query.delete().eq('user_id', userId);
          const { error: matchedError } = await query.delete().eq('matched_user_id', userId);
          
          if (userError || matchedError) {
            console.warn(`⚠️ Erro parcial ao limpar ${table}:`, { userError, matchedError });
          }
        } else if (table === 'invites') {
          const { error: createdByError } = await query.delete().eq('created_by', userId);
          
          if (createdByError) {
            console.warn(`⚠️ Erro ao limpar ${table}:`, createdByError);
          }
        } else if (table === 'referrals') {
          const { error: referrerError } = await query.delete().eq('referrer_id', userId);
          
          if (referrerError) {
            console.warn(`⚠️ Erro ao limpar ${table}:`, referrerError);
          }
        } else {
          // Tabelas padrão com user_id
          const { error } = await query.delete().eq('user_id', userId);
          
          if (error) {
            console.warn(`⚠️ Erro ao limpar ${table}:`, error);
            deletionResults.push({ table, status: 'error', error: error.message });
          } else {
            deletionResults.push({ table, status: 'success' });
          }
        }
        
      } catch (error: any) {
        console.warn(`⚠️ Erro inesperado ao limpar ${table}:`, error);
        deletionResults.push({ table, status: 'error', error: error.message });
      }
    }

    // FASE 2: Remover perfil do usuário
    console.log("👤 Removendo perfil do usuário...");
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error("❌ Erro ao remover perfil:", profileError);
      if (!forceDelete) {
        return new Response(
          JSON.stringify({ 
            error: 'Erro ao remover perfil do usuário',
            details: profileError.message 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log("✅ Perfil removido com sucesso");
    }

    // FASE 3: Exclusão definitiva do usuário no Auth
    console.log("🔐 Removendo usuário do sistema de autenticação...");
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("❌ Erro ao excluir usuário do Auth:", deleteError);
      
      if (!forceDelete) {
        return new Response(
          JSON.stringify({ 
            error: `Falha ao excluir usuário do sistema de autenticação: ${deleteError.message}`,
            partialCleanup: deletionResults
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log("✅ Usuário removido do sistema de autenticação");
    }

    // Log de auditoria
    console.log("📝 Registrando ação de exclusão...");
    try {
      await supabaseAdmin.rpc('log_permission_change', {
        user_id: user.id,
        action_type: 'complete_user_deletion',
        target_user_id: userId,
        old_value: JSON.stringify({ email: userEmail, name: userName }),
        new_value: 'DELETED'
      });
    } catch (auditError: any) {
      console.warn("⚠️ Erro ao registrar log de auditoria:", auditError);
    }

    console.log("🎉 Exclusão completa realizada com sucesso!");

    // Resposta de sucesso
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Usuário ${userEmail} foi completamente removido do sistema`,
        deletionResults,
        userId,
        userEmail,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("❌ Erro crítico durante exclusão:", error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor durante exclusão',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
