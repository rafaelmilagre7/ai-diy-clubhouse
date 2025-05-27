
import React, { useEffect, useState } from 'react';
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { useNavigate } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';
import { MoticonAnimation } from '@/components/onboarding/MoticonAnimation';
import { useProgress } from '@/hooks/onboarding/useProgress';
import { useOnboardingValidation } from '@/hooks/onboarding/useOnboardingValidation';
import { Loader2 } from 'lucide-react';

const NovoOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { progress, isLoading, refreshProgress } = useProgress();
  const { validateOnboardingCompletion, getIncompleteSteps } = useOnboardingValidation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        if (hasChecked) {
          return;
        }

        await refreshProgress();
        setHasChecked(true);
        
        if (progress) {
          // Usar validação robusta para verificar se onboarding está realmente completo
          const isReallyComplete = validateOnboardingCompletion(progress);
          
          if (isReallyComplete) {
            console.log("Onboarding realmente completo, redirecionando para página de conclusão...");
            navigate('/onboarding/completed');
            return;
          }
          
          // Se tem progresso mas não está completo, verificar qual etapa está faltando
          const incompleteSteps = getIncompleteSteps(progress);
          
          if (incompleteSteps.length > 0) {
            const nextStep = incompleteSteps[0];
            console.log(`Onboarding incompleto. Próxima etapa: ${nextStep}`);
            
            // Mapear próxima etapa para rota
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
              navigate(nextRoute);
              return;
            }
          }
        }
        
        // Se chegou até aqui, o usuário pode iniciar o onboarding
        setIsInitialLoad(false);
      } catch (error) {
        console.error("Erro ao verificar status do onboarding:", error);
        setIsInitialLoad(false);
      }
    };

    if (!isLoading) {
      checkOnboardingStatus();
    }
  }, [navigate, progress, isLoading, refreshProgress, hasChecked, validateOnboardingCompletion, getIncompleteSteps]);

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  // Mostrar um spinner enquanto verifica o status do onboarding
  if (isInitialLoad || isLoading) {
    return (
      <MemberLayout>
        <div className="bg-gradient-to-b from-[#0F111A] to-[#161A2C] min-h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-viverblue mx-auto" />
            <p className="mt-4 text-viverblue-light">Verificando seu status de onboarding...</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

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
                Preencha este formulário para personalizarmos sua experiência na plataforma.
              </p>
            </div>
            
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl shadow-xl p-8">
              <OnboardingForm onSuccess={handleSuccess} />
            </div>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};

export default NovoOnboarding;
