
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface OnboardingResetResult {
  success: boolean;
  message: string;
  backup_info?: any;
  deleted_counts?: any;
  total_deleted?: number;
  users_initialized?: number;
}

export const resetAllOnboardingData = async (): Promise<OnboardingResetResult> => {
  try {
    console.log('🚀 Iniciando reset completo do sistema de onboarding...');
    
    const { data, error } = await supabase.rpc('reset_all_onboarding_data');
    
    if (error) {
      console.error('❌ Erro ao resetar dados de onboarding:', error);
      throw error;
    }
    
    console.log('✅ Reset completo realizado:', data);
    return data as OnboardingResetResult;
  } catch (error: any) {
    console.error('❌ Erro no reset completo:', error);
    return {
      success: false,
      message: error.message || 'Erro desconhecido ao resetar dados'
    };
  }
};

export const initializeOnboardingForAllUsers = async (): Promise<OnboardingResetResult> => {
  try {
    console.log('🔧 Inicializando onboarding para todos os usuários...');
    
    const { data, error } = await supabase.rpc('initialize_onboarding_for_all_users');
    
    if (error) {
      console.error('❌ Erro ao inicializar onboarding:', error);
      throw error;
    }
    
    console.log('✅ Onboarding inicializado:', data);
    return data as OnboardingResetResult;
  } catch (error: any) {
    console.error('❌ Erro na inicialização:', error);
    return {
      success: false,
      message: error.message || 'Erro desconhecido ao inicializar onboarding'
    };
  }
};

export const executeCompleteReset = async (): Promise<OnboardingResetResult> => {
  try {
    console.log('🔄 Executando reset completo e reinicialização...');
    
    // 1. Reset completo
    const resetResult = await resetAllOnboardingData();
    if (!resetResult.success) {
      throw new Error(resetResult.message);
    }
    
    // 2. Inicializar para todos os usuários
    const initResult = await initializeOnboardingForAllUsers();
    if (!initResult.success) {
      throw new Error(initResult.message);
    }
    
    const finalResult = {
      success: true,
      message: 'Reset completo e reinicialização realizados com sucesso',
      backup_info: resetResult.backup_info,
      deleted_counts: resetResult.deleted_counts,
      total_deleted: resetResult.total_deleted,
      users_initialized: initResult.users_initialized
    };
    
    console.log('🎉 Reset completo finalizado:', finalResult);
    return finalResult;
  } catch (error: any) {
    console.error('❌ Erro no reset completo:', error);
    return {
      success: false,
      message: error.message || 'Erro no processo de reset completo'
    };
  }
};

// Função para admins executarem via console
export const adminExecuteCompleteReset = async () => {
  const result = await executeCompleteReset();
  
  if (result.success) {
    toast.success('Reset completo realizado com sucesso!', {
      description: `${result.total_deleted} registros removidos, ${result.users_initialized} usuários inicializados`
    });
    console.log('✅ Reset completo bem-sucedido:', result);
  } else {
    toast.error(`Erro no reset: ${result.message}`);
    console.error('❌ Falha no reset:', result);
  }
  
  return result;
};

// Expor função no console para teste rápido
if (typeof window !== 'undefined') {
  (window as any).adminExecuteCompleteReset = adminExecuteCompleteReset;
  (window as any).resetAllOnboarding = executeCompleteReset;
}
