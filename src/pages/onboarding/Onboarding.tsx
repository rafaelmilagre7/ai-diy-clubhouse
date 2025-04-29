
import React from 'react';
import { OnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { EtapasProgresso } from '@/components/onboarding/EtapasProgresso';
import { useOnboardingSteps } from '@/hooks/onboarding/useOnboardingSteps';
import MemberLayout from '@/components/layout/MemberLayout';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

const Onboarding: React.FC = () => {
  const { currentStepIndex, steps, navigateToStep, saveStepData, progress } = useOnboardingSteps();
  const location = useLocation();

  // Verificar se estamos na rota raiz do onboarding e renderizar o componente apropriado
  const isRootPath = location.pathname === "/onboarding";
  
  // Esta função será passada para EtapasProgresso: salva dados e navega ao destino
  const handleStepClick = async (stepIndexDestino: number) => {
    // Não processa clique na etapa já atual
    if (stepIndexDestino === currentStepIndex) return;

    // Se existir referência para salvar, invocá-la (padrão futuro); por ora assume saveStepData global
    try {
      // Coletar dados do step atual; depende do step
      const currentStep = steps[currentStepIndex];
      // Exemplo de como coletar dados: se seu onboarding passa dados pelo progress,
      // você pode adaptar para obter do estado do formulário específico, se necessário.
      // Aqui tentamos salvar o progress do step atual, mesmo se não tivesse mudança.

      // Se possível, obter os dados do formulário através de ref (caso o step exporte setFormRef)
      // Por simplicidade, usamos progress
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

      // Salva os dados antes de trocar de etapa
      await saveStepData(stepId, data, false);

    } catch (e) {
      console.error("Erro ao salvar dados antes de trocar de etapa:", e);
      toast.error("Erro ao salvar dados antes de trocar de etapa");
      // Em caso de erro, não navega
      return;
    }

    // Agora troca de etapa
    navigateToStep(stepIndexDestino);
  };

  return (
    <MemberLayout>
      <div className="container max-w-screen-lg mx-auto py-8 px-4">
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
