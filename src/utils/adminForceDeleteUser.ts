
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ForceDeleteResult {
  success: boolean;
  message: string;
  details: {
    backup_records: number;
    affected_tables: string[];
    auth_user_deleted: boolean;
    error_count: number;
    error_messages: string[];
    operation_timestamp: string;
  };
}

export const forceDeleteUser = async (userEmail: string): Promise<ForceDeleteResult> => {
  try {
    console.log(`🗑️ [FORCE DELETE] Iniciando exclusão COMPLETA para: ${userEmail}`);
    console.log(`🔧 [FORCE DELETE] Usando função SQL CORRIGIDA com limpeza de benefit_clicks`);
    
    const { data, error } = await supabase.rpc('admin_force_delete_auth_user', {
      user_email: userEmail
    });
    
    if (error) {
      console.error('❌ Erro na função SQL de exclusão completa:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Nenhum resultado retornado da função de exclusão');
    }
    
    console.log('📊 Resultado da exclusão completa:', data);
    
    // Validar se a exclusão da auth.users foi bem-sucedida
    if (data.success && data.details.auth_user_deleted) {
      console.log('✅ [FORCE DELETE] Usuário removido da auth.users com sucesso!');
      console.log(`📋 [FORCE DELETE] Tabelas afetadas: ${data.details.affected_tables.join(', ')}`);
    } else if (data.details.error_count > 0) {
      console.warn('⚠️ [FORCE DELETE] Exclusão com erros:', data.details.error_messages);
    }
    
    return data as ForceDeleteResult;
  } catch (error: any) {
    console.error('❌ Erro ao executar exclusão completa:', error);
    return {
      success: false,
      message: error.message || 'Erro desconhecido na exclusão completa',
      details: {
        backup_records: 0,
        affected_tables: [],
        auth_user_deleted: false,
        error_count: 1,
        error_messages: [error.message || 'Erro desconhecido'],
        operation_timestamp: new Date().toISOString()
      }
    };
  }
};

// Função para uso via console do admin
export const adminForceDeleteUser = async (userEmail: string) => {
  const result = await forceDeleteUser(userEmail);
  
  if (result.success) {
    toast.success('✅ Exclusão COMPLETA realizada', {
      description: `${result.message} - ${result.details.affected_tables.length} tabelas afetadas`,
      duration: 8000
    });
    console.log('✅ Resultado da exclusão completa:', result);
    console.log('🎯 Email agora está COMPLETAMENTE liberado para novos registros');
  } else {
    toast.error('❌ Erro na exclusão completa', {
      description: result.message,
      duration: 10000
    });
    console.error('❌ Falha na exclusão completa:', result);
    
    if (result.details.error_messages.length > 0) {
      console.error('📋 Erros detalhados:', result.details.error_messages);
    }
  }
  
  return result;
};
