
import React, { useRef } from 'react';
import { OnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { EtapasProgresso } from '@/components/onboarding/EtapasProgresso';
import { useOnboardingSteps } from '@/hooks/onboarding/useOnboardingSteps';
import MemberLayout from '@/components/layout/MemberLayout';
import { toast } from 'sonner';

const Onboarding: React.FC = () => {
  const { currentStepIndex, steps, navigateToStep, saveStepData, progress } = useOnboardingSteps();
  const formStateRef = useRef<any>(null);

  // Função robusta para troca de etapa com salvamento de dados
  const handleStepClick = async (stepIndexDestino: number) => {
    // Permite navegar para qualquer etapa (inclusive a 1ª)
    if (stepIndexDestino === currentStepIndex) return;

    try {
      const currentStep = steps[currentStepIndex];
      const stepId = currentStep.id;
      let data = {};

      switch (stepId) {
        case 'personal':
          data = progress?.personal_info || {};
          break;
        case 'professional_data':
          data = progress?.professional_info || {};
          break;
        case 'business_context':
          data = progress?.business_context || {};
          break;
        case 'ai_exp':
          data = progress?.ai_experience || {};
          break;
        case 'business_goals':
          data = progress?.business_goals || {};
          break;
        case 'experience_personalization':
          data = progress?.experience_personalization || {};
          break;
        case 'complementary_info':
          data = progress?.complementary_info || {};
          break;
        default:
          data = {};
      }

      // Salva os dados do passo atual antes de trocar (mesmo que não tenha alteração)
      await saveStepData(stepId, data, false);

    } catch (e) {
      toast.error("Erro ao salvar dados antes de trocar de etapa");
      return;
    }

    // Troca de etapa SEM restrição, inclusive para a primeira
    navigateToStep(stepIndexDestino);
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
