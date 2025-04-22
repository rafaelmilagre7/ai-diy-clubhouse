
import React, { useEffect } from 'react';
import { OnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { EtapasProgresso } from '@/components/onboarding/EtapasProgresso';
import { useOnboardingSteps } from '@/hooks/onboarding/useOnboardingSteps';
import MemberLayout from '@/components/layout/MemberLayout';
import { toast } from 'sonner';

const Onboarding: React.FC = () => {
  const { 
    currentStepIndex, 
    steps, 
    navigateToStep, 
    saveStepData, 
    progress, 
    refreshProgress 
  } = useOnboardingSteps();

  // Carregamento inicial
  useEffect(() => {
    const loadData = async () => {
      try {
        await refreshProgress();
        console.log("Dados do onboarding atualizados");
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    
    loadData();
  }, [refreshProgress]);

  // Função melhorada para navegação entre etapas
  const handleStepClick = async (stepIndexDestino: number) => {
    // Evitar recarregar a mesma etapa
    if (stepIndexDestino === currentStepIndex) return;

    try {
      // Salvar dados da etapa atual antes de navegar
      const currentStep = steps[currentStepIndex];
      const stepId = currentStep.id;
      
      // Extrair dados da etapa atual com base no ID
      let data = {};
      if (progress) {
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
        }
      }

      // Salvar dados atuais
      await saveStepData(stepId, data, false);
      console.log(`Navegando para etapa ${stepIndexDestino + 1}`);
      
      // Navegar para a etapa desejada
      navigateToStep(stepIndexDestino);
    } catch (e) {
      console.error("Erro ao trocar de etapa:", e);
      toast.error("Não foi possível trocar de etapa. Tente novamente.");
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
