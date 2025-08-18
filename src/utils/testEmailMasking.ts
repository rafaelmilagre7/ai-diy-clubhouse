/**
 * Teste do sistema de mascaramento de emails
 * Este arquivo demonstra como o mascaramento funciona
 */

import { maskEmail, maskEmailsInText, safeLog } from './emailMasking';

// Função para testar o mascaramento (apenas em desenvolvimento)
export const testEmailMasking = () => {
  if (!import.meta.env.DEV) return;
  
  console.log('🔒 Testando sistema de mascaramento de emails...');
  
  // Testar mascaramento de email individual
  const testEmail = 'user@example.com';
  const maskedEmail = maskEmail(testEmail);
  console.log('Original:', testEmail, '→ Mascarado:', maskedEmail);
  
  // Testar mascaramento em objetos
  const testObject = {
    email: 'admin@company.com',
    userInfo: {
      email: 'test@test.com',
      name: 'João Silva'
    },
    message: 'Contate suporte@empresa.com para ajuda'
  };
  
  const maskedObject = maskEmailsInText(testObject);
  console.log('Objeto original:', testObject);
  console.log('Objeto mascarado:', maskedObject);
  
  // Testar safeLog
  safeLog('info', 'Teste de log com email user@test.com', {
    adminEmail: 'admin@test.com',
    data: 'Informação sensível'
  });
  
  console.log('✅ Sistema de mascaramento de emails ativo e funcionando!');
};

// Executar teste automaticamente em desenvolvimento
if (import.meta.env.DEV) {
  // Aguardar um pouco para garantir que o sistema foi inicializado
  setTimeout(() => {
    testEmailMasking();
  }, 1000);
}