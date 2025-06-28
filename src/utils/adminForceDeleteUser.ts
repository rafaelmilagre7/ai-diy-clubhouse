
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
      'learning_comments',
      'learning_progress', 
      'learning_certificates',
      'learning_lesson_nps',
      'benefit_clicks',
      'forum_posts',
      'forum_topics',
      'forum_reactions',
      'implementation_trails',
      'analytics'
    ];

    // Deletar de cada tabela
    for (const table of tablesToClean) {
      try {
        const { count, error } = await supabase
          .from(table as any)
          .delete()
          .eq('user_id', userId)
          .select('*', { count: 'exact', head: true });

        if (error) {
          errorMessages.push(`Erro em ${table}: ${error.message}`);
        } else {
          const deletedCount = count || 0;
          if (deletedCount > 0) {
            totalDeleted += deletedCount;
            affectedTables.push(table);
            logger.info(`✅ Deletados ${deletedCount} registros de ${table}`);
          }
        }
      } catch (err: any) {
        errorMessages.push(`Erro ao deletar de ${table}: ${err.message}`);
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
