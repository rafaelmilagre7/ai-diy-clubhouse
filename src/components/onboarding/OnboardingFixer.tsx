
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { fixCurrentUserOnboarding, getOnboardingProgress } from '@/utils/onboardingFix';
import { toast } from '@/hooks/use-toast';

/**
 * Componente otimizado que corrige problemas de onboarding
 * Reduz frequência de execução e evita loops
 */
export const OnboardingFixer = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [hasProcessed, setHasProcessed] = useState(false);
  const processingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const processOnboardingFix = async () => {
      // Evitar múltiplas execuções
      if (!user || !profile || hasProcessed || processingRef.current) {
        return;
      }

      // Verificar apenas se realmente há inconsistência
      if (profile.onboarding_completed) {
        setHasProcessed(true);
        return;
      }

      processingRef.current = true;
      
      try {
        console.log('🔍 [FIXER] Verificando onboarding para:', user.id);

        const onboardingProgress = await getOnboardingProgress(user.id);
        
        if (!onboardingProgress) {
          console.log('ℹ️ [FIXER] Nenhum progresso encontrado');
          return;
        }

        // Verificação simples de completude
        const isCompleted = onboardingProgress.is_completed || 
          (onboardingProgress.completed_steps && onboardingProgress.completed_steps.length >= 5);

        if (isCompleted && !profile.onboarding_completed) {
          console.log('🔧 [FIXER] Aplicando correção de sincronização');
          
          const success = await fixCurrentUserOnboarding();
          
          if (success) {
            setHasProcessed(true);
            toast({
              title: "Progresso sincronizado!",
              description: "Redirecionando para o dashboard...",
            });
            
            // Timeout mais longo para evitar conflitos
            timeoutRef.current = setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 3000);
          }
        } else {
          setHasProcessed(true);
        }
      } catch (error) {
        console.error('❌ [FIXER] Erro na verificação:', error);
        setHasProcessed(true);
      } finally {
        processingRef.current = false;
      }
    };

    // Timeout maior para evitar execução excessiva
    const delayedProcess = setTimeout(processOnboardingFix, 8000);
    
    return () => {
      clearTimeout(delayedProcess);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user?.id, profile?.onboarding_completed]); // Dependências mais específicas

  return null;
};

export default OnboardingFixer;
