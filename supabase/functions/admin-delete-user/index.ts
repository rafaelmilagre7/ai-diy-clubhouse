
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🗑️ Iniciando processo de exclusão de usuário");

    // Obter dados da requisição
    const { userId, forceDelete = false, softDelete = false }: DeleteUserRequest = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'ID do usuário não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("🎯 Processando exclusão do usuário:", userId, { forceDelete, softDelete });

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

    // Buscar dados do usuário antes da exclusão
    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('email, name')
      .eq('id', userId)
      .single();

    const userEmail = profileData?.email || 'email não encontrado';
    const userName = profileData?.name || 'nome não encontrado';

    console.log("📋 Dados do usuário:", { email: userEmail, name: userName, softDelete });

    // Se for soft delete, apenas limpar dados mas manter o usuário
    if (softDelete) {
      console.log("🧹 Executando soft delete - limpando dados mas mantendo usuário...");
      
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
        'user_checklists'
      ];

      const deletionResults = [];

      for (const table of tables) {
        try {
          console.log(`🗑️ Limpando tabela: ${table}`);
          
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

      // Resetar campos do perfil mas manter o usuário
      await supabaseAdmin
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
          linkedin_url: null
        })
        .eq('id', userId);

      console.log("✅ Soft delete concluído");

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Dados do usuário ${userEmail} foram limpos (soft delete)`,
          type: 'soft_delete',
          deletionResults,
          userId,
          userEmail
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // EXCLUSÃO COMPLETA - Limpeza de dados relacionados
    console.log("🧹 Iniciando limpeza completa de dados relacionados...");

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

    // Remover perfil do usuário
    console.log("👤 Removendo perfil do usuário...");
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError && !forceDelete) {
      console.error("❌ Erro ao remover perfil:", profileError);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao remover perfil do usuário',
          details: profileError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exclusão definitiva do usuário no Auth
    console.log("🔐 Removendo usuário do sistema de autenticação...");
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError && !forceDelete) {
      console.error("❌ Erro ao excluir usuário do Auth:", deleteError);
      return new Response(
        JSON.stringify({ 
          error: `Falha ao excluir usuário do sistema de autenticação: ${deleteError.message}`,
          partialCleanup: deletionResults
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("🎉 Exclusão completa realizada com sucesso!");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Usuário ${userEmail} foi completamente removido do sistema`,
        type: 'complete_delete',
        deletionResults,
        userId,
        userEmail
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("❌ Erro crítico durante exclusão:", error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor durante exclusão',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
