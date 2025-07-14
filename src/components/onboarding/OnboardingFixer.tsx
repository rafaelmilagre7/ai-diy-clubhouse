import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { fixCurrentUserOnboarding, getOnboardingProgress } from '@/utils/onboardingFix';
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

      console.log('🔍 [FIXER] Verificando consistência do onboarding...', {
        userId: user.id,
        profileOnboardingCompleted: profile.onboarding_completed
      });

      // Verificar se há inconsistência entre onboarding e profile
      const onboardingProgress = await getOnboardingProgress(user.id);
      
      if (onboardingProgress) {
        console.log('📊 [FIXER] Progresso do onboarding:', onboardingProgress);
        
        // Verificar se o usuário deveria estar completo baseado nos steps concluídos
        const allStepsCompleted = onboardingProgress.completed_steps && 
          onboardingProgress.completed_steps.length >= 6 &&
          onboardingProgress.completed_steps.includes(1) &&
          onboardingProgress.completed_steps.includes(2) &&
          onboardingProgress.completed_steps.includes(3) &&
          onboardingProgress.completed_steps.includes(4) &&
          onboardingProgress.completed_steps.includes(5) &&
          onboardingProgress.completed_steps.includes(6);

        const shouldBeCompleted = allStepsCompleted || onboardingProgress.current_step === 7;

        // Se deveria estar completo mas não está, ou se há inconsistência com o profile
        if (shouldBeCompleted && (!onboardingProgress.is_completed || !profile.onboarding_completed)) {
          console.log('🔧 [FIXER] Inconsistência detectada! Aplicando correção...', {
            allStepsCompleted,
            currentStep: onboardingProgress.current_step,
            isCompleted: onboardingProgress.is_completed,
            profileCompleted: profile.onboarding_completed
          });
          
          const success = await fixCurrentUserOnboarding();
          
          if (success) {
            setHasFixed(true);
            toast({
              title: "Correção aplicada!",
              description: "Seu progresso de onboarding foi corrigido. Redirecionando...",
            });
            
            // Aguardar um pouco e recarregar para sincronizar estado
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 1500);
          }
        } else if (!shouldBeCompleted) {
          console.log('ℹ️ [FIXER] Onboarding realmente não está completo, redirecionando para etapa correta...');
        } else {
          console.log('✅ [FIXER] Onboarding já está correto e sincronizado');
        }
      }
    };

    tryFix();
  }, [user, profile, hasFixed]);

  return null; // Componente invisível
};

export default OnboardingFixer;