
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

export interface AdminForceDeleteResult {
  success: boolean;
  message: string;
  details: {
    total_records_deleted: number;
    affected_tables: string[];
    auth_user_deleted: boolean;
    backup_records: number;
    error_count: number;
    error_messages: string[];
    operation_timestamp: string;
  };
}

export const adminForceDeleteUser = async (userEmail: string): Promise<AdminForceDeleteResult> => {
  try {
    logger.info(`🗑️ [ADMIN DELETE] Iniciando exclusão total para: ${userEmail}`);

    // Buscar o usuário pelo email
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (profileError || !profiles) {
      throw new Error(`Usuário não encontrado: ${userEmail}`);
    }

    const userId = profiles.id;
    let totalDeleted = 0;
    const affectedTables: string[] = [];
    const errorMessages: string[] = [];

    // Lista de tabelas que existem e podem ter referências ao usuário
    const tablesToClean = [
      { name: 'learning_comments', exists: true },
      { name: 'learning_progress', exists: true }, 
      { name: 'learning_certificates', exists: true },
      { name: 'learning_lesson_nps', exists: true },
      { name: 'benefit_clicks', exists: true },
      { name: 'forum_posts', exists: true },
      { name: 'forum_topics', exists: true },
      { name: 'forum_reactions', exists: true },
      { name: 'implementation_trails', exists: true },
      { name: 'analytics', exists: true }
    ];

    // Deletar de cada tabela com tratamento de erro individual
    for (const table of tablesToClean) {
      try {
        const { count, error } = await supabase
          .from(table.name as any)
          .delete()
          .eq('user_id', userId)
          .select('*', { count: 'exact', head: true });

        if (error) {
          errorMessages.push(`Erro em ${table.name}: ${error.message}`);
        } else {
          const deletedCount = count || 0;
          if (deletedCount > 0) {
            totalDeleted += deletedCount;
            affectedTables.push(table.name);
            logger.info(`✅ Deletados ${deletedCount} registros de ${table.name}`);
          }
        }
      } catch (err: any) {
        errorMessages.push(`Erro ao deletar de ${table.name}: ${err.message}`);
        logger.warn(`⚠️ Tabela ${table.name} pode não existir ou ter problemas de acesso`);
      }
    }

    // Atualizar convites relacionados
    try {
      const { error: inviteError } = await supabase
        .from('invites')
        .update({ used_at: new Date().toISOString() })
        .eq('email', userEmail)
        .is('used_at', null);

      if (!inviteError) {
        affectedTables.push('invites');
      }
    } catch (err: any) {
      errorMessages.push(`Erro ao atualizar convites: ${err.message}`);
    }

    // Finalmente, deletar o perfil
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileDeleteError) {
      errorMessages.push(`Erro ao deletar perfil: ${profileDeleteError.message}`);
    } else {
      totalDeleted += 1;
      affectedTables.push('profiles');
    }

    const result: AdminForceDeleteResult = {
      success: errorMessages.length === 0,
      message: errorMessages.length === 0 
        ? `Usuário ${userEmail} removido completamente`
        : `Exclusão parcial concluída com ${errorMessages.length} erros`,
      details: {
        total_records_deleted: totalDeleted,
        affected_tables: affectedTables,
        auth_user_deleted: false, // Não conseguimos deletar de auth.users via client
        backup_records: 0, // Não implementado backup automático
        error_count: errorMessages.length,
        error_messages: errorMessages,
        operation_timestamp: new Date().toISOString()
      }
    };

    logger.info(`✅ Exclusão concluída para ${userEmail}:`, result);
    return result;

  } catch (error: any) {
    logger.error(`❌ Erro na exclusão de ${userEmail}:`, error);
    
    return {
      success: false,
      message: `Erro crítico: ${error.message}`,
      details: {
        total_records_deleted: 0,
        affected_tables: [],
        auth_user_deleted: false,
        backup_records: 0,
        error_count: 1,
        error_messages: [error.message],
        operation_timestamp: new Date().toISOString()
      }
    };
  }
};
