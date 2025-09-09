// Console administrativo para operações de limpeza e reset de usuários
// Para usar: abra o console do navegador e execute as funções globais

import { adminTechnicalCleanup, verifyEmailStatus } from './adminTechnicalCleanup';
import { adminManualCleanup } from './manualUserCleanup';
import { adminQuickReset } from './adminUserReset';

// =============================================================================
// FUNÇÕES PRINCIPAIS PARA CONSOLE DO ADMIN
// =============================================================================

/**
 * LIMPEZA TÉCNICA COMPLETA - Para emails "contaminados" 
 * Usa quando o usuário recebe "email já existe" mas nunca se cadastrou
 * 
 * @param userEmail - Email do usuário para limpar
 * @returns Resultado com novo convite criado
 */
export const execTechnicalCleanup = async (userEmail: string) => {
  console.log(`🔧 [ADMIN CONSOLE] Executando limpeza técnica para: ${userEmail}`);
  return await adminTechnicalCleanup(userEmail);
};

/**
 * LIMPEZA MANUAL - Para usuários com perfil criado
 * 
 * @param userEmail - Email do usuário para limpar
 * @returns Resultado da limpeza
 */
export const execManualCleanup = async (userEmail: string) => {
  console.log(`🧹 [ADMIN CONSOLE] Executando limpeza manual para: ${userEmail}`);
  return await adminManualCleanup(userEmail);
};

/**
 * RESET RÁPIDO - Para resetar progresso de usuário
 * 
 * @param userEmail - Email do usuário para resetar
 * @returns Resultado do reset
 */
export const execQuickReset = async (userEmail: string) => {
  console.log(`🔄 [ADMIN CONSOLE] Executando reset rápido para: ${userEmail}`);
  return await adminQuickReset(userEmail);
};

/**
 * VERIFICAR STATUS - Para diagnosticar o estado do email
 * 
 * @param userEmail - Email para verificar
 * @returns Status completo do email
 */
export const checkEmailStatus = async (userEmail: string) => {
  console.log(`🔍 [ADMIN CONSOLE] Verificando status de: ${userEmail}`);
  return await verifyEmailStatus(userEmail);
};

// =============================================================================
// CASO ESPECÍFICO: WAGNER@ACAIREPUBLIC.COM
// =============================================================================

/**
 * RESOLVER PROBLEMA DO WAGNER - Função específica para o caso
 * Email contaminado que precisa de limpeza técnica completa
 */
export const resolveWagnerIssue = async () => {
  const userEmail = 'wagner@acairepublic.com';
  
  console.log(`🎯 [CASO ESPECÍFICO] Resolvendo problema do Wagner: ${userEmail}`);
  console.log(`📋 Diagnóstico: Email contaminado - usuário recebe "já possui conta" mas nunca completou cadastro`);
  console.log(`🔧 Solução: Limpeza técnica completa + novo convite`);
  
  // Executar limpeza técnica completa
  const result = await execTechnicalCleanup(userEmail);
  
  if (result.success && result.inviteLink) {
    console.log(`\n🎉 PROBLEMA RESOLVIDO!`);
    console.log(`📧 Email limpo: ${userEmail}`);
    console.log(`🔗 Novo link de convite: ${result.inviteLink}`);
    console.log(`📱 Token: ${result.newInviteToken}`);
    console.log(`\n📋 INSTRUÇÕES PARA O USUÁRIO:`);
    console.log(`1. Acesse o link: ${result.inviteLink}`);
    console.log(`2. Complete TODO o processo de cadastro`);
    console.log(`3. Defina sua senha`);
    console.log(`4. Faça login normalmente`);
    console.log(`\n✅ O usuário poderá então usar "Esqueci minha senha" normalmente.`);
  } else {
    console.error(`❌ Falha na resolução:`, result.message);
  }
  
  return result;
};

// =============================================================================
// DISPONIBILIZAR NO CONSOLE GLOBAL
// =============================================================================

// Disponibilizar funções no console global para facilitar uso
if (typeof window !== 'undefined') {
  (window as any).adminConsole = {
    // Funções principais
    technicalCleanup: execTechnicalCleanup,
    manualCleanup: execManualCleanup,
    quickReset: execQuickReset,
    checkEmail: checkEmailStatus,
    
    // Caso específico
    resolveWagner: resolveWagnerIssue,
    
    // Helpers
    help: () => {
      console.log(`
🔧 CONSOLE ADMINISTRATIVO - COMANDOS DISPONÍVEIS:

📋 DIAGNÓSTICO:
  adminConsole.checkEmail('email@exemplo.com') - Verificar status do email

🧹 LIMPEZA:
  adminConsole.technicalCleanup('email@exemplo.com') - Limpeza completa (email contaminado)
  adminConsole.manualCleanup('email@exemplo.com') - Limpeza manual (usuário existente)
  adminConsole.quickReset('email@exemplo.com') - Reset rápido de progresso

🎯 CASO ESPECÍFICO:
  adminConsole.resolveWagner() - Resolver problema do Wagner especificamente

❓ AJUDA:
  adminConsole.help() - Mostrar esta ajuda

📖 QUANDO USAR CADA FUNÇÃO:
  - technicalCleanup: Email "contaminado", usuário nunca completou cadastro
  - manualCleanup: Usuário existente que precisa ser removido completamente  
  - quickReset: Resetar progresso/onboarding de usuário ativo
  - checkEmail: Diagnosticar o estado atual antes de tomar ação
      `);
    }
  };
  
  console.log(`🔧 Console administrativo carregado! Digite "adminConsole.help()" para ver comandos.`);
}

export { execTechnicalCleanup as technicalCleanup };
export { execManualCleanup as manualCleanup };
export { execQuickReset as quickReset };
export { checkEmailStatus as checkEmail };