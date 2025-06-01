
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface NetworkingResetResult {
  success: boolean;
  message: string;
  clearedData?: {
    matches: number;
    connections: number;
    preferences: number;
    notifications: number;
  };
  backup_timestamp?: string;
  error?: string;
}

/**
 * Limpa TODOS os dados de networking da plataforma
 * ATENÇÃO: Esta ação é irreversível e afeta todos os usuários
 */
export async function clearAllNetworkingData(): Promise<NetworkingResetResult> {
  try {
    console.log('🧹 Iniciando limpeza global do networking...');
    
    // Executar a função RPC de limpeza global
    const { data, error } = await supabase.rpc('clear_all_networking_data');
    
    if (error) {
      console.error('❌ Erro na limpeza global:', error);
      return {
        success: false,
        message: 'Erro ao executar limpeza global',
        error: error.message
      };
    }
    
    console.log('✅ Limpeza global concluída:', data);
    
    return {
      success: true,
      message: data.message,
      clearedData: data.cleared_data,
      backup_timestamp: data.backup_timestamp
    };
    
  } catch (error: any) {
    console.error('❌ Exceção na limpeza global:', error);
    return {
      success: false,
      message: 'Erro inesperado durante a limpeza',
      error: error.message
    };
  }
}

/**
 * Versão interativa para o console do navegador
 */
export async function interactiveClearNetworking() {
  const confirmed = confirm(
    '⚠️ ATENÇÃO: Esta ação irá DELETAR TODOS os dados de networking de TODOS os usuários!\n\n' +
    'Isso inclui:\n' +
    '- Todos os matches de networking\n' +
    '- Todas as conexões entre usuários\n' +
    '- Todas as preferências de networking\n' +
    '- Todas as notificações de conexão\n\n' +
    'Esta ação é IRREVERSÍVEL!\n\n' +
    'Deseja continuar?'
  );
  
  if (!confirmed) {
    console.log('🚫 Limpeza cancelada pelo usuário');
    return;
  }
  
  const result = await clearAllNetworkingData();
  
  if (result.success) {
    console.log('✅ Limpeza global concluída com sucesso!');
    console.log('📊 Dados limpos:', result.clearedData);
    console.log('💾 Backup criado em:', result.backup_timestamp);
    toast.success('Limpeza global do networking concluída!');
  } else {
    console.error('❌ Falha na limpeza:', result.message);
    toast.error(`Erro na limpeza: ${result.message}`);
  }
  
  return result;
}

// Disponibilizar no console global para testes
if (typeof window !== 'undefined') {
  (window as any).clearAllNetworking = interactiveClearNetworking;
  console.log('🔧 Função disponível no console: window.clearAllNetworking()');
}
