
import { clearAllNetworkingData } from './adminNetworkingReset';

/**
 * Executa a limpeza global do networking imediatamente
 * Para garantir que a plataforma esteja 100% limpa
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
      
      // Exibir resumo final
      console.log('\n🔥 RESUMO DA LIMPEZA:');
      console.log('▫️ Todos os matches de networking removidos');
      console.log('▫️ Todas as conexões entre usuários removidas');
      console.log('▫️ Todas as preferências de networking removidas');
      console.log('▫️ Todas as notificações de conexão removidas');
      console.log('▫️ Sistema bloqueado até onboarding completo');
      console.log('▫️ Geração futura apenas para usuários qualificados');
      
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

// Executar automaticamente quando o módulo for carregado
if (typeof window !== 'undefined') {
  // Aguardar um pouco para garantir que tudo esteja carregado
  setTimeout(() => {
    executeGlobalNetworkingCleanup();
  }, 2000);
}
