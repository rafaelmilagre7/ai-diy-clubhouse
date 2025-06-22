
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface AdminForceDeleteResult {
  success: boolean;
  message: string;
  details: {
    backup_records: number;
    affected_tables: string[];
    auth_user_deleted: boolean;
    error_count: number;
    error_messages: string[];
    operation_timestamp: string;
    total_records_deleted: number;
  };
}

/**
 * Executa exclusão TOTAL de usuário usando a função SQL unificada
 * Esta função remove COMPLETAMENTE o usuário do sistema, incluindo auth.users
 */
export async function adminForceDeleteUser(userEmail: string): Promise<AdminForceDeleteResult> {
  try {
    console.log(`🗑️ [ADMIN DELETE] Iniciando exclusão TOTAL para: ${userEmail}`);
    
    // Chamar a função SQL unificada
    const { data, error } = await supabase.rpc('admin_force_delete_auth_user', {
      user_email: userEmail
    });

    if (error) {
      console.error('❌ Erro na função SQL:', error);
      throw new Error(`Erro na exclusão: ${error.message}`);
    }

    if (!data) {
      throw new Error('Resposta vazia da função de exclusão');
    }

    console.log('📋 Resultado da exclusão:', data);

    return {
      success: data.success,
      message: data.message,
      details: data.details || {
        backup_records: 0,
        affected_tables: [],
        auth_user_deleted: false,
        error_count: 1,
        error_messages: ['Resposta malformada'],
        operation_timestamp: new Date().toISOString(),
        total_records_deleted: 0
      }
    };

  } catch (error: any) {
    console.error('❌ Erro ao executar exclusão total:', error);
    
    return {
      success: false,
      message: `Erro na exclusão: ${error.message}`,
      details: {
        backup_records: 0,
        affected_tables: [],
        auth_user_deleted: false,
        error_count: 1,
        error_messages: [error.message],
        operation_timestamp: new Date().toISOString(),
        total_records_deleted: 0
      }
    };
  }
}
