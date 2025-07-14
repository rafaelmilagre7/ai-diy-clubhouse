import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { fixCurrentUserOnboarding } from '@/utils/onboardingFix';
import { toast } from '@/hooks/use-toast';

/**
 * Componente que detecta e corrige automaticamente problemas de onboarding
 */
export const OnboardingFixer = () => {
  const { user, profile } = useAuth();
  const [hasFixed, setHasFixed] = useState(false);

  useEffect(() => {
    const tryFix = async () => {
      if (!user || !profile || hasFixed) return;

      // Detectar se o usuário tem o problema específico do Rafael
      if (user.id === 'dc418224-acd7-4f5f-9a7e-e1c981b78fb6' && !profile.onboarding_completed) {
        console.log('🔧 [FIXER] Aplicando correção automática para usuário Rafael...');
        
        const success = await fixCurrentUserOnboarding();
        
        if (success) {
          setHasFixed(true);
          toast({
            title: "Correção aplicada!",
            description: "Seu progresso de onboarding foi corrigido. Recarregando...",
          });
          
          // Aguardar um pouco e recarregar
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        }
      }
    };

    tryFix();
  }, [user, profile, hasFixed]);

  return null; // Componente invisível
};

export default OnboardingFixer;