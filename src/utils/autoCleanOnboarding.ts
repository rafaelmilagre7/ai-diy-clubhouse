
import { cleanRafaelData } from './cleanOnboardingData';

// Executar automaticamente a limpeza dos dados do Rafael
console.log('🚀 Executando limpeza automática dos dados de onboarding do Rafael...');

// Aguardar um pouco para garantir que o Supabase está inicializado
setTimeout(async () => {
  try {
    const result = await cleanRafaelData();
    console.log('📊 Resultado da limpeza automática:', result);
  } catch (error) {
    console.error('❌ Erro na limpeza automática:', error);
  }
}, 2000);

export {};
