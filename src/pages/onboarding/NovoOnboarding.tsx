
import React, { useEffect, useState } from 'react';
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { useNavigate } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';
import { MoticonAnimation } from '@/components/onboarding/MoticonAnimation';
import { useProgress } from '@/hooks/onboarding/useProgress';
import { Loader2 } from 'lucide-react';

const NovoOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { progress, isLoading, refreshProgress } = useProgress();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  // Verificar status do onboarding e redirecionar se necessário
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        if (hasChecked) {
          return; // Evita verificações múltiplas
        }

        // Forçar refresh dos dados para garantir informações atualizadas
        await refreshProgress();
        setHasChecked(true);
        
        if (progress?.is_completed) {
          console.log("Onboarding já está completo, redirecionando para página de revisão...");
          navigate('/onboarding/completed');
          return;
        } 
        
        if (progress?.current_step && progress.completed_steps?.length > 0) {
          // Se já iniciou mas não completou, continuar de onde parou
          console.log("Onboarding em andamento, redirecionando para etapa atual...");
          navigate(`/onboarding/${progress.current_step}`);
          return;
        }
        
        // Se chegou até aqui, o usuário pode iniciar o onboarding normalmente
        setIsInitialLoad(false);
      } catch (error) {
        console.error("Erro ao verificar status do onboarding:", error);
        // Mesmo com erro, permitir que o usuário tente preencher
        setIsInitialLoad(false);
      }
    };

    if (!isLoading) {
      checkOnboardingStatus();
    }
  }, [navigate, progress, isLoading, refreshProgress, hasChecked]);

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
