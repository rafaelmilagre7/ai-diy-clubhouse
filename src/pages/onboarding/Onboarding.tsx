
import React, { useRef } from 'react';
import { OnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { EtapasProgresso } from '@/components/onboarding/EtapasProgresso';
import { useOnboardingSteps } from '@/hooks/onboarding/useOnboardingSteps';
import MemberLayout from '@/components/layout/MemberLayout';
import { toast } from 'sonner';

const Onboarding: React.FC = () => {
  const { currentStepIndex, steps, navigateToStep, saveStepData, progress } = useOnboardingSteps();
  const formStateRef = useRef<any>(null); // Pode ser aprimorado para tipo específico no futuro

  // Esta função será passada para EtapasProgresso: salva dados e navega ao destino
  const handleStepClick = async (stepIndexDestino: number) => {
    try {
      // Não processa clique na etapa já atual
      if (stepIndexDestino === currentStepIndex) return;

      // Capturar o ID do passo atual para uso no log e salvamento
      const currentStep = steps[currentStepIndex];
      const stepId = currentStep?.id || "";
      console.log(`Trocando da etapa ${stepId} (${currentStepIndex}) para ${stepIndexDestino}`);
      
      // Navegação direta sem tentar salvar dados intermediários
      navigateToStep(stepIndexDestino);
    } catch (error) {
      console.error("Erro ao trocar de etapa:", error);
      toast.error("Ocorreu um erro ao trocar de etapa");
    }
  };

  return (
    <MemberLayout>
      <div className="container max-w-screen-lg mx-auto py-8">
        <OnboardingHeader isOnboardingCompleted={false} />
        <div className="mt-6">
          <EtapasProgresso
            currentStep={currentStepIndex + 1}
            totalSteps={steps.length}
            onStepClick={handleStepClick}
          />
        </div>
        <div className="mt-8">
          <OnboardingSteps />
        </div>
      </div>
    </MemberLayout>
  );
};

export default Onboarding;
