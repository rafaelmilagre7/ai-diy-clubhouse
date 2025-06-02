
import { clearAllNetworkingData } from './adminNetworkingReset';

/**
 * Executa a limpeza global do networking sob demanda
 * IMPORTANTE: Esta função não executa mais automaticamente
 */
export async function executeGlobalNetworkingCleanup() {
  console.log('🚀 Executando limpeza global do networking...');
  
  try {
    const result = await clearAllNetworkingData();
    
    if (result.success) {
      console.log('✅ LIMPEZA GLOBAL CONCLUÍDA COM SUCESSO!');
      console.log('📊 Dados removidos:', result.clearedData);
      console.log('💾 Backup criado em:', result.backup_timestamp);
      console.log('🎯 Plataforma 100% preparada e limpa!');
    } else {
      console.error('❌ Falha na limpeza global:', result.message);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Erro inesperado na limpeza:', error);
    return {
      success: false,
      message: 'Erro inesperado durante a limpeza',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// REMOVIDO: Execução automática que causava problemas
// Função disponível apenas para uso administrativo manual
if (typeof window !== 'undefined') {
  (window as any).executeGlobalNetworkingCleanup = executeGlobalNetworkingCleanup;
  console.log('🔧 Função disponível no console: window.executeGlobalNetworkingCleanup()');
}
