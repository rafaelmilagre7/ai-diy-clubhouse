
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteUserRequest {
  userId: string;
  forceDelete?: boolean;
  softDelete?: boolean;
}

interface DeleteResult {
  success: boolean;
  message: string;
  details: {
    profileDeleted: boolean;
    authUserDeleted: boolean;
    relatedDataCleared: boolean;
    tablesAffected: string[];
    errors: any[];
  };
  userId: string;
  userEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🗑️ === INICIANDO PROCESSO DE EXCLUSÃO DE USUÁRIO ===");

    const { userId, forceDelete = false, softDelete = false }: DeleteUserRequest = await req.json();
    
    if (!userId) {
      console.error("❌ ID do usuário não fornecido");
      return new Response(
        JSON.stringify({ success: false, error: 'ID do usuário não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🎯 Processando exclusão para userId: ${userId}`, { 
      forceDelete, 
      softDelete,
      timestamp: new Date().toISOString()
    });

    // Criar cliente administrativo
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

    // Buscar dados do usuário ANTES da exclusão
    console.log("📋 Buscando dados do usuário...");
    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('email, name, role')
      .eq('id', userId)
      .single();

    const userEmail = profileData?.email || 'email não encontrado';
    const userName = profileData?.name || 'nome não encontrado';
    const userRole = profileData?.role || 'papel não encontrado';

    console.log("👤 Dados do usuário:", { 
      email: userEmail, 
      name: userName, 
      role: userRole,
      softDelete 
    });

    const result: DeleteResult = {
      success: false,
      message: '',
      details: {
        profileDeleted: false,
        authUserDeleted: false,
        relatedDataCleared: false,
        tablesAffected: [],
        errors: []
      },
      userId,
      userEmail
    };

    // === SOFT DELETE ===
    if (softDelete) {
      console.log("🧹 === EXECUTANDO SOFT DELETE ===");
      
      const tables = [
        'onboarding_progress',
        'onboarding_history', 
        'onboarding_ai_conversations',
        'onboarding_chat_messages',
        'onboarding_complementary_info',
        'implementation_trails',
        'invites',
        'direct_messages',
        'member_connections',
        'notifications',
        'forum_posts',
        'forum_topics',
        'learning_progress',
        'progress',
        'user_checklists',
        'analytics'
      ];

      let clearedTables = 0;
      const errors = [];

      for (const table of tables) {
        try {
          console.log(`🗑️ Limpando tabela: ${table}`);
          
          let deleteQuery;
          if (table === 'direct_messages') {
            await supabaseAdmin.from(table).delete().eq('sender_id', userId);
            await supabaseAdmin.from(table).delete().eq('recipient_id', userId);
          } else if (table === 'member_connections') {
            await supabaseAdmin.from(table).delete().eq('requester_id', userId);
            await supabaseAdmin.from(table).delete().eq('recipient_id', userId);
          } else if (table === 'invites') {
            await supabaseAdmin.from(table).delete().eq('created_by', userId);
          } else {
            const { error } = await supabaseAdmin.from(table).delete().eq('user_id', userId);
            if (error && !forceDelete) {
              throw error;
            }
          }
          
          clearedTables++;
          result.details.tablesAffected.push(table);
          console.log(`✅ Tabela ${table} limpa com sucesso`);
        } catch (error: any) {
          console.warn(`⚠️ Erro ao limpar ${table}:`, error);
          errors.push({ table, error: error.message });
          if (!forceDelete) {
            result.details.errors.push(error);
          }
        }
      }

      // Resetar campos do perfil mas manter o usuário
      console.log("🔄 Resetando campos do perfil...");
      try {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            company_name: null,
            industry: null,
            current_position: null,
            referrals_count: 0,
            successful_referrals_count: 0,
            whatsapp_number: null,
            professional_bio: null,
            skills: [],
            linkedin_url: null,
            available_for_networking: true
          })
          .eq('id', userId);

        if (error) throw error;
        console.log("✅ Perfil resetado com sucesso");
      } catch (error: any) {
        console.error("❌ Erro ao resetar perfil:", error);
        result.details.errors.push(error);
      }

      result.success = true;
      result.message = `Soft delete concluído. ${clearedTables} tabelas processadas.`;
      result.details.relatedDataCleared = true;
      result.details.profileDeleted = false; // Perfil mantido, apenas resetado
      result.details.authUserDeleted = false; // Usuário mantido no Auth

      console.log("✅ === SOFT DELETE CONCLUÍDO ===", {
        tabelas_limpas: clearedTables,
        erros: errors.length,
        usuario: userEmail
      });

      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // === HARD DELETE ===
    console.log("💥 === EXECUTANDO HARD DELETE ===");
    
    // 1. Limpar dados relacionados
    console.log("🧹 Limpando dados relacionados...");
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

    let clearedTables = 0;
    const errors = [];

    for (const table of tables) {
      try {
        console.log(`🗑️ Limpando tabela: ${table}`);
        
        if (table === 'direct_messages') {
          await supabaseAdmin.from(table).delete().eq('sender_id', userId);
          await supabaseAdmin.from(table).delete().eq('recipient_id', userId);
        } else if (table === 'member_connections' || table === 'network_connections') {
          await supabaseAdmin.from(table).delete().eq('requester_id', userId);
          await supabaseAdmin.from(table).delete().eq('recipient_id', userId);
        } else if (table === 'network_matches') {
          await supabaseAdmin.from(table).delete().eq('user_id', userId);
          await supabaseAdmin.from(table).delete().eq('matched_user_id', userId);
        } else if (table === 'invites') {
          await supabaseAdmin.from(table).delete().eq('created_by', userId);
        } else if (table === 'referrals') {
          await supabaseAdmin.from(table).delete().eq('referrer_id', userId);
        } else {
          const { error } = await supabaseAdmin.from(table).delete().eq('user_id', userId);
          if (error && !forceDelete) {
            throw error;
          }
        }
        
        clearedTables++;
        result.details.tablesAffected.push(table);
        console.log(`✅ Tabela ${table} limpa`);
      } catch (error: any) {
        console.warn(`⚠️ Erro ao limpar ${table}:`, error);
        errors.push({ table, error: error.message });
        if (!forceDelete) {
          result.details.errors.push(error);
        }
      }
    }

    result.details.relatedDataCleared = clearedTables > 0;

    // 2. Remover perfil
    console.log("👤 Removendo perfil...");
    try {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error("❌ Erro ao remover perfil:", profileError);
        if (!forceDelete) {
          throw profileError;
        }
        result.details.errors.push(profileError);
      } else {
        result.details.profileDeleted = true;
        console.log("✅ Perfil removido com sucesso");
      }
    } catch (error: any) {
      console.error("❌ Erro crítico ao remover perfil:", error);
      result.details.errors.push(error);
    }

    // 3. Excluir usuário do Auth
    console.log("🔐 Removendo usuário do sistema de autenticação...");
    try {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (deleteError) {
        console.error("❌ Erro ao excluir usuário do Auth:", deleteError);
        if (!forceDelete) {
          throw deleteError;
        }
        result.details.errors.push(deleteError);
      } else {
        result.details.authUserDeleted = true;
        console.log("✅ Usuário removido do Auth com sucesso");
      }
    } catch (error: any) {
      console.error("❌ Erro crítico ao remover do Auth:", error);
      result.details.errors.push(error);
    }

    // Determinar sucesso
    const hasErrors = result.details.errors.length > 0;
    const criticalSuccess = result.details.profileDeleted || result.details.authUserDeleted;
    
    result.success = forceDelete ? true : (!hasErrors && criticalSuccess);
    result.message = result.success 
      ? `Usuário ${userEmail} removido completamente (${clearedTables} tabelas limpas)`
      : `Falha parcial na remoção. ${result.details.errors.length} erros encontrados.`;

    console.log("🎉 === HARD DELETE CONCLUÍDO ===", {
      sucesso: result.success,
      tabelas_limpas: clearedTables,
      erros: result.details.errors.length,
      perfil_removido: result.details.profileDeleted,
      auth_removido: result.details.authUserDeleted,
      usuario: userEmail
    });

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("💥 === ERRO CRÍTICO NA EXCLUSÃO ===", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erro interno do servidor durante exclusão',
        details: {
          message: error.message,
          stack: error.stack
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
