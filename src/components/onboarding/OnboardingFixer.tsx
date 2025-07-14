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
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const tryFix = async () => {
      if (!user || !profile || hasFixed || isProcessing) return;

      setIsProcessing(true);
      
      try {
        console.log('🔍 [FIXER] Verificando consistência do onboarding...', {
          userId: user.id,
          profileOnboardingCompleted: profile.onboarding_completed
        });

        // Aguardar um pouco mais para garantir que tudo foi processado após o registro
        await new Promise(resolve => setTimeout(resolve, 2000));

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
            
            toast({
              title: "Sincronizando progresso...",
              description: "Corrigindo inconsistências no seu onboarding.",
            });
            
            const success = await fixCurrentUserOnboarding();
            
            if (success) {
              setHasFixed(true);
              toast({
                title: "Progresso sincronizado!",
                description: "Redirecionando para o dashboard...",
              });
              
              // Aguardar um pouco e recarregar para sincronizar estado
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 2000);
            } else {
              console.warn('⚠️ [FIXER] Falha na correção do onboarding');
            }
          } else if (!shouldBeCompleted) {
            console.log('ℹ️ [FIXER] Onboarding realmente não está completo, usuário precisa continuar');
          } else {
            console.log('✅ [FIXER] Onboarding já está correto e sincronizado');
          }
        } else {
          console.warn('⚠️ [FIXER] Nenhum progresso de onboarding encontrado');
        }
      } catch (error) {
        console.error('❌ [FIXER] Erro ao verificar onboarding:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    // Aguardar um pouco mais para garantir que o contexto auth está estável
    const timeoutId = setTimeout(tryFix, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [user, profile, hasFixed, isProcessing]);

  return null; // Componente invisível
};

export default OnboardingFixer;