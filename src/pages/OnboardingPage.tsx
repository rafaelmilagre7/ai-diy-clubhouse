import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useOnboarding } from '@/hooks/onboarding/useOnboarding';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Step1PersonalInfo } from '@/components/onboarding/steps/Step1PersonalInfo';
// import { Step2BusinessInfo } from '@/components/onboarding/steps/Step2BusinessInfo';
// import { Step3AIExperience } from '@/components/onboarding/steps/Step3AIExperience';
// import { Step4Goals } from '@/components/onboarding/steps/Step4Goals';
// import { Step5Personalization } from '@/components/onboarding/steps/Step5Personalization';
// import { Step6Welcome } from '@/components/onboarding/steps/Step6Welcome';
import { Loader2 } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const { user, profile } = useAuth();
  const {
    current_step,
    completed_steps,
    is_completed,
    data,
    isLoading,
    isSaving,
    saveStepData,
    goToNextStep,
    goToPrevStep,
    completeOnboarding,
    nina_message,
  } = useOnboarding();

  // Redirect se usuário não está logado
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect se onboarding já foi completado
  if (is_completed) {
    return <Navigate to="/dashboard" replace />;
  }

  // Loading inicial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando seu progresso...</p>
        </div>
      </div>
    );
  }

  const stepConfig = {
    1: {
      title: 'Vamos nos conhecer melhor',
      subtitle: 'Conte-nos um pouco sobre você para personalizarmos sua experiência',
      component: Step1PersonalInfo,
    },
    2: {
      title: 'Contexto do seu negócio',
      subtitle: 'Entenda como podemos ajudar sua empresa a crescer com IA',
      component: () => <div>Step 2 - Em construção</div>,
    },
    3: {
      title: 'Sua experiência com IA',
      subtitle: 'Queremos saber quais ferramentas você já usa ou gostaria de usar',
      component: () => <div>Step 3 - Em construção</div>,
    },
    4: {
      title: 'Seus objetivos',
      subtitle: 'Defina suas metas para que possamos criar o melhor plano para você',
      component: () => <div>Step 4 - Em construção</div>,
    },
    5: {
      title: 'Personalização',
      subtitle: 'Como você prefere aprender e ser acompanhado?',
      component: () => <div>Step 5 - Em construção</div>,
    },
    6: {
      title: 'Bem-vindo(a) ao Viver de IA!',
      subtitle: 'Sua jornada personalizada está pronta para começar',
      component: () => <div>Step 6 - Mensagem da NINA: {nina_message}</div>,
    },
  };

  const currentStepConfig = stepConfig[current_step as keyof typeof stepConfig];
  const StepComponent = currentStepConfig.component;

  const handleNext = async () => {
    if (current_step === 5) {
      // Finalizar onboarding no step 5
      await completeOnboarding(data.personalization || {});
    } else {
      await goToNextStep();
    }
  };

  const handleStepSubmit = async (stepData: any) => {
    const success = await saveStepData(current_step, stepData);
    if (success) {
      await handleNext();
    }
  };

  const canProceed = () => {
    switch (current_step) {
      case 1:
        return !!(data.personal_info?.name && data.personal_info?.phone && data.personal_info?.city);
      case 2:
        return !!(data.business_info?.company_name && data.business_info?.company_sector);
      case 3:
        return !!(data.ai_experience?.experience_level);
      case 4:
        return !!(data.goals_info?.primary_goal);
      case 5:
        return !!(data.personalization?.learning_style);
      case 6:
        return true;
      default:
        return false;
    }
  };

  return (
    <OnboardingLayout
      currentStep={current_step}
      totalSteps={6}
      title={currentStepConfig.title}
      subtitle={currentStepConfig.subtitle}
      onPrevious={current_step > 1 ? goToPrevStep : undefined}
      onNext={current_step < 6 ? handleNext : undefined}
      nextLabel={current_step === 5 ? 'Finalizar' : current_step === 6 ? 'Ir para Dashboard' : 'Continuar'}
      isLoading={isSaving}
      canProceed={canProceed()}
      completedSteps={completed_steps}
    >
      {current_step === 1 && (
        <Step1PersonalInfo
          initialData={data.personal_info}
          onDataChange={(personalData) => {
            // Atualizar dados localmente sem salvar ainda
            if (data.personal_info) {
              Object.assign(data.personal_info, personalData);
            } else {
              data.personal_info = personalData;
            }
          }}
          onNext={() => handleStepSubmit(data.personal_info || {})}
        />
      )}
      
      {current_step !== 1 && (
        <div className="text-center p-8">
          <p className="text-muted-foreground">Step {current_step} em construção...</p>
        </div>
      )}
    </OnboardingLayout>
  );
};

export default OnboardingPage;