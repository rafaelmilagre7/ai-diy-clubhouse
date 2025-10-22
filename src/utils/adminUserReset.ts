import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ResetUserResult {
  success: boolean;
  message: string;
  backup_records?: number;
  user_id?: string;
  reset_timestamp?: string;
}

export const resetUserByEmail = async (userEmail: string): Promise<ResetUserResult> => {
  try {
    const { data, error } = await supabase.rpc('admin_reset_user', {
      user_email: userEmail
    });
    
    if (error) {
      console.error('❌ Erro na função RPC:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Nenhum resultado retornado da função de reset');
    }
    
    return data as ResetUserResult;
  } catch (error: any) {
    console.error('❌ Erro ao resetar usuário:', error);
    return {
      success: false,
      message: error.message || 'Erro desconhecido ao resetar usuário'
    };
  }
};

export const resetCurrentUser = async (): Promise<ResetUserResult> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.email) {
      throw new Error('Usuário não encontrado ou sem email');
    }
    
    return await resetUserByEmail(user.email);
  } catch (error: any) {
    console.error('❌ Erro ao resetar usuário atual:', error);
    return {
      success: false,
      message: error.message || 'Erro ao resetar usuário atual'
    };
  }
};

// Função para teste rápido via console
export const adminQuickReset = async (userEmail: string) => {
  const result = await resetUserByEmail(userEmail);
  
  if (result.success) {
    toast.success(`✅ Reset realizado com sucesso!`, {
      description: `${result.backup_records} registros salvos em backup.`
    });
  } else {
    toast.error(`❌ Erro no reset: ${result.message}`);
    console.error('❌ Falha no reset:', result);
  }
  
  return result;
};