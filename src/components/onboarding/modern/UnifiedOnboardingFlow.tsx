
import React, { useEffect } from 'react';
import { SimpleOnboardingFlow } from './SimpleOnboardingFlow';
import { useOnboardingMigration } from '@/hooks/onboarding/useOnboardingMigration';
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/common/LoadingScreen';

export const UnifiedOnboardingFlow: React.FC = () => {
  const { user } = useAuth();
  const { runFullMigration } = useOnboardingMigration();

  // Executar migração automaticamente na primeira carga (silenciosamente)
  useEffect(() => {
    if (user?.id) {
      console.log('🔄 Verificando necessidade de migração de dados...');
      
      // Executar migração em background sem toast desnecessário
      runFullMigration().then(result => {
        if (result.success) {
          console.log('✅ Verificação de migração concluída:', result.message);
        } else {
          console.warn('⚠️ Verificação de migração com problemas:', result.message);
        }
      });
    }
  }, [user?.id, runFullMigration]);

  if (!user) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  return <SimpleOnboardingFlow />;
};
