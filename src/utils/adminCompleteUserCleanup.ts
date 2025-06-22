
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface CompleteCleanupResult {
  success: boolean;
  message: string;
  details: {
    tablesAffected: string[];
    backupRecords: number;
    authUserDeleted: boolean;
    errors: any[];
  };
}

export const completeUserCleanup = async (userEmail: string): Promise<CompleteCleanupResult> => {
  try {
    console.log(`🧹 [COMPLETE CLEANUP] Iniciando limpeza completa para: ${userEmail}`);
    
    const { data, error } = await supabase.functions.invoke('admin-delete-user', {
      body: { 
        userEmail: userEmail,
        forceDelete: true // Força a exclusão completa incluindo auth.users
      }
    });
    
    if (error) {
      console.error('❌ Erro na Edge Function:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Nenhum resultado retornado da função de limpeza');
    }
    
    console.log('📊 Resultado da limpeza completa:', data);
    
    return data as CompleteCleanupResult;
  } catch (error: any) {
    console.error('❌ Erro ao fazer limpeza completa:', error);
    return {
      success: false,
      message: error.message || 'Erro desconhecido na limpeza completa',
      details: {
        tablesAffected: [],
        backupRecords: 0,
        authUserDeleted: false,
        errors: [{ operation: 'function_call', error: error.message }]
      }
    };
  }
};

// Função para uso via console do admin
export const adminCompleteCleanup = async (userEmail: string) => {
  const result = await completeUserCleanup(userEmail);
  
  if (result.success) {
    toast.success('✅ Limpeza completa realizada', {
      description: `${result.message} - ${result.details.tablesAffected.length} tabelas afetadas`,
      duration: 5000
    });
    console.log('✅ Resultado da limpeza completa:', result);
  } else {
    toast.error('❌ Erro na limpeza completa', {
      description: result.message,
      duration: 8000
    });
    console.error('❌ Falha na limpeza completa:', result);
  }
  
  return result;
};
