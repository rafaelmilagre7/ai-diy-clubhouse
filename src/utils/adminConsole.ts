// Utilitários administrativos para execução via console
import { adminTechnicalCleanup } from './adminTechnicalCleanup';
import { adminManualCleanup } from './manualUserCleanup';
import { adminQuickReset } from './adminUserReset';

// Expor funções globalmente para uso no console
(window as any).adminUtils = {
  // Limpeza técnica completa (inclui criação de novo convite)
  cleanupUser: adminTechnicalCleanup,
  
  // Limpeza manual (apenas remove dados)
  manualCleanup: adminManualCleanup,
  
  // Reset de usuário (via RPC)
  resetUser: adminQuickReset,
  
  // Limpeza específica do Wagner
  cleanupWagner: () => adminTechnicalCleanup('wagner@acairepublic.com'),
  
  // Verificar status de um email
  checkEmail: async (email: string) => {
    const { verifyEmailStatus } = await import('./adminTechnicalCleanup');
    const status = await verifyEmailStatus(email);
    console.log(`📊 Status do email ${email}:`, status);
    return status;
  }
};

console.log('🔧 Admin Utils carregados! Use: window.adminUtils');
console.log('📋 Funções disponíveis:');
console.log('  - adminUtils.cleanupWagner() // Limpeza completa do Wagner');
console.log('  - adminUtils.cleanupUser(email) // Limpeza de qualquer usuário');
console.log('  - adminUtils.checkEmail(email) // Verificar status de email');

export {};