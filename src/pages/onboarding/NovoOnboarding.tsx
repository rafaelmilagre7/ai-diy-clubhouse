
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';
import { MoticonAnimation } from '@/components/onboarding/MoticonAnimation';
import { useProgress } from '@/hooks/onboarding/useProgress';
import { useOnboardingValidation } from '@/hooks/onboarding/useOnboardingValidation';
import { useOnboardingSteps } from '@/hooks/onboarding/useOnboardingSteps';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const NovoOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { progress, isLoading, refreshProgress } = useProgress();
  const { validateOnboardingCompletion, getIncompleteSteps } = useOnboardingValidation();
  const { currentStep } = useOnboardingSteps();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasCheckedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Evitar múltiplas execuções
        if (hasCheckedRef.current) {
          console.log("[NovoOnboarding] Verificação já realizada, ignorando");
          return;
        }

        // Timeout de segurança para evitar loop infinito
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          console.error("[NovoOnboarding] Timeout na verificação do onboarding");
          toast.error("Timeout na verificação. Redirecionando para primeira etapa.");
          setIsInitialLoad(false);
          navigate('/onboarding/personal-info');
        }, 10000); // 10 segundos de timeout

        console.log("[NovoOnboarding] Iniciando verificação do status do onboarding");
        hasCheckedRef.current = true;
        
        await refreshProgress();
        
        if (progress) {
          console.log("[NovoOnboarding] Progresso encontrado:", {
            isCompleted: progress.is_completed,
            currentStep: progress.current_step,
            completedSteps: progress.completed_steps
          });
          
          // Verificação robusta de completude
          const isReallyComplete = validateOnboardingCompletion(progress);
          
          console.log("[NovoOnboarding] Resultado da validação:", {
            isReallyComplete,
            progressIsCompleted: progress.is_completed
          });
          
          if (isReallyComplete && progress.is_completed) {
            console.log("[NovoOnboarding] Onboarding realmente completo, redirecionando...");
            clearTimeout(timeoutRef.current);
            navigate('/onboarding/completed');
            return;
          }
          
          // Se não está completo, verificar próxima etapa
          const incompleteSteps = getIncompleteSteps(progress);
          
          if (incompleteSteps.length > 0) {
            const nextStep = incompleteSteps[0];
            console.log(`[NovoOnboarding] Próxima etapa incompleta: ${nextStep}`);
            
            const stepRoutes = {
              'personal_info': '/onboarding/personal-info',
              'professional_info': '/onboarding/professional-data',
              'business_context': '/onboarding/business-context',
              'ai_experience': '/onboarding/ai-experience',
              'business_goals': '/onboarding/club-goals',
              'experience_personalization': '/onboarding/customization',
              'complementary_info': '/onboarding/complementary',
              'review': '/onboarding/review'
            };
            
            const nextRoute = stepRoutes[nextStep as keyof typeof stepRoutes];
            if (nextRoute) {
              clearTimeout(timeoutRef.current);
              navigate(nextRoute);
              return;
            }
          }
          
          // Se current_step existe, ir para ela
          if (progress.current_step && progress.current_step !== 'completed') {
            const stepRoutes = {
              'personal_info': '/onboarding/personal-info',
              'professional_info': '/onboarding/professional-data',
              'business_context': '/onboarding/business-context',
              'ai_experience': '/onboarding/ai-experience',
              'business_goals': '/onboarding/club-goals',
              'experience_personalization': '/onboarding/customization',
              'complementary_info': '/onboarding/complementary',
              'review': '/onboarding/review'
            };
            
            const currentRoute = stepRoutes[progress.current_step as keyof typeof stepRoutes];
            if (currentRoute) {
              console.log(`[NovoOnboarding] Redirecionando para etapa atual: ${progress.current_step}`);
              clearTimeout(timeoutRef.current);
              navigate(currentRoute);
              return;
            }
          }
        }
        
        // Fallback: começar do início
        console.log("[NovoOnboarding] Nenhuma condição atendida, começando do início");
        clearTimeout(timeoutRef.current);
        navigate('/onboarding/personal-info');
        
      } catch (error) {
        console.error("[NovoOnboarding] Erro ao verificar status:", error);
        clearTimeout(timeoutRef.current);
        toast.error("Erro ao verificar onboarding. Começando do início.");
        navigate('/onboarding/personal-info');
      } finally {
        setIsInitialLoad(false);
      }
    };

    // Só executar se não estiver carregando e não tiver verificado ainda
    if (!isLoading && !hasCheckedRef.current) {
      checkOnboardingStatus();
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [navigate, progress, isLoading, refreshProgress, validateOnboardingCompletion, getIncompleteSteps]);

  // Mostrar spinner enquanto verifica
  if (isInitialLoad || isLoading) {
    return (
      <MemberLayout>
        <div className="bg-gradient-to-b from-[#0F111A] to-[#161A2C] min-h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-viverblue mx-auto" />
            <p className="mt-4 text-viverblue-light">Verificando seu status de onboarding...</p>
            <p className="mt-2 text-sm text-gray-400">Se demorar muito, recarregue a página</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  // Se chegou aqui, algo deu errado - mostrar interface padrão
  return (
    <MemberLayout>
      <div className="bg-gradient-to-b from-[#0F111A] to-[#161A2C] min-h-[calc(100vh-80px)]">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10 text-center">
              <div className="flex justify-center mb-6">
                <MoticonAnimation />
              </div>
              <h1 className="text-4xl font-heading font-bold mb-3 text-white bg-clip-text bg-gradient-to-r from-white to-white/70">
                Bem-vindo ao VIVER DE IA
              </h1>
              <p className="text-xl text-viverblue-light max-w-2xl mx-auto">
                Estamos preparando sua experiência personalizada na plataforma.
              </p>
            </div>
            
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl shadow-xl p-8">
              {currentStep && (
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    {currentStep.title}
                  </h2>
                  <p className="text-viverblue-light">
                    Continue preenchendo suas informações para personalizar sua experiência.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};

export default NovoOnboarding;
