
import { cleanRafaelData } from './cleanOnboardingData';
import { createTestUser } from './createTestUser';

// Função para setup automático mais seguro
const safeAutoSetup = async () => {
  try {
    console.log('🔧 Executando setup automático seguro...');
    
    // Verificar se estamos em desenvolvimento
    if (!import.meta.env.DEV) {
      console.log('⚠️ Setup automático desabilitado em produção');
      return;
    }
    
    // Apenas verificar/criar usuário de teste, sem limpeza automática
    console.log('👤 Verificando usuário de teste...');
    const testUserResult = await createTestUser();
    
    if (testUserResult.success && testUserResult.message === 'Usuário criado com sucesso') {
      console.log('✅ Setup completo!');
      console.log(`📧 Email: ${testUserResult.email}`);
      console.log(`🔑 Senha: ${testUserResult.password}`);
    } else if (testUserResult.success) {
      console.log('✅ Usuário de teste verificado');
    } else {
      console.warn('⚠️ Falha na verificação do usuário de teste:', testUserResult.error);
    }
    
  } catch (error) {
    console.error('❌ Erro no setup automático:', error);
  }
};

// Executar apenas se explicitamente importado
console.log('🚀 Módulo autoCleanOnboarding carregado');

// Aguardar um pouco para garantir que o Supabase está inicializado
setTimeout(safeAutoSetup, 3000);

export { safeAutoSetup };
