
import { cleanRafaelData } from './cleanOnboardingData';
import { createTestUser } from './createTestUser';

// Executar automaticamente a limpeza dos dados do Rafael e criar usuário de teste
console.log('🚀 Executando setup automático para desenvolvimento...');

// Aguardar um pouco para garantir que o Supabase está inicializado
setTimeout(async () => {
  try {
    // Limpar dados do Rafael
    console.log('🧹 Limpando dados do Rafael...');
    const cleanResult = await cleanRafaelData();
    console.log('📊 Resultado da limpeza:', cleanResult);
    
    // Criar usuário de teste
    console.log('👤 Criando usuário de teste...');
    const testUserResult = await createTestUser();
    console.log('📊 Resultado da criação do usuário:', testUserResult);
    
    if (testUserResult.success) {
      console.log('✅ Setup completo!');
      console.log(`📧 Email: ${testUserResult.email}`);
      console.log(`🔑 Senha: ${testUserResult.password}`);
      console.log('💡 Use essas credenciais para testar o onboarding');
    }
    
  } catch (error) {
    console.error('❌ Erro no setup automático:', error);
  }
}, 2000);

export {};
