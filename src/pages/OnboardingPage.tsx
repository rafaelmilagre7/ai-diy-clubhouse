import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useOnboarding } from '@/hooks/onboarding/useOnboarding';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Step1PersonalInfo } from '@/components/onboarding/steps/Step1PersonalInfo';
import { Step2BusinessInfo } from '@/components/onboarding/steps/Step2BusinessInfo';
import { Step3AIExperience } from '@/components/onboarding/steps/Step3AIExperience';
import { Step4Goals } from '@/components/onboarding/steps/Step4Goals';
import { Step5Personalization } from '@/components/onboarding/steps/Step5Personalization';
import { Step6Welcome } from '@/components/onboarding/steps/Step6Welcome';
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
      component: Step2BusinessInfo,
    },
    3: {
      title: 'Sua experiência com IA',
      subtitle: 'Queremos saber quais ferramentas você já usa ou gostaria de usar',
      component: Step3AIExperience,
    },
    4: {
      title: 'Seus objetivos',
      subtitle: 'Defina suas metas para que possamos criar o melhor plano para você',
      component: Step4Goals,
    },
    5: {
      title: 'Personalização',
      subtitle: 'Como você prefere aprender e ser acompanhado?',
      component: Step5Personalization,
    },
    6: {
      title: 'Bem-vindo(a) ao Viver de IA!',
      subtitle: 'Sua jornada personalizada está pronta para começar',
      component: Step6Welcome,
    },
  };

  const currentStepConfig = stepConfig[current_step as keyof typeof stepConfig];
  const StepComponent = currentStepConfig.component;

  const handleNext = async () => {
    if (current_step === 6) {
      // Finalizar onboarding no step 6
      await completeOnboarding(data.personalization || {});
    } else {
      await goToNextStep();
    }
  };

  const handleStepSubmit = async (stepData: any) => {
    // Simplificar: passar dados brutos e deixar o hook processar
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
            if (data.personal_info) {
              Object.assign(data.personal_info, personalData);
            } else {
              data.personal_info = personalData;
            }
          }}
          onNext={() => handleStepSubmit(data.personal_info as any)}
        />
      )}

      {current_step === 2 && (
        <Step2BusinessInfo
          initialData={data.business_info}
          onDataChange={(businessData) => {
            if (data.business_info) {
              Object.assign(data.business_info, businessData);
            } else {
              data.business_info = businessData;
            }
          }}
          onNext={() => handleStepSubmit(data.business_info as any)}
        />
      )}

      {current_step === 3 && (
        <Step3AIExperience
          initialData={data.ai_experience}
          onDataChange={(aiData) => {
            if (data.ai_experience) {
              Object.assign(data.ai_experience, aiData);
            } else {
              data.ai_experience = aiData;
            }
          }}
          onNext={() => handleStepSubmit(data.ai_experience as any)}
        />
      )}

      {current_step === 4 && (
        <Step4Goals
          initialData={data.goals_info}
          onDataChange={(goalsData) => {
            if (data.goals_info) {
              Object.assign(data.goals_info, goalsData);
            } else {
              data.goals_info = goalsData;
            }
          }}
          onNext={() => handleStepSubmit(data.goals_info as any)}
        />
      )}

      {current_step === 5 && (
        <Step5Personalization
          initialData={data.personalization}
          onDataChange={(personalizationData) => {
            if (data.personalization) {
              Object.assign(data.personalization, personalizationData);
            } else {
              data.personalization = personalizationData;
            }
          }}
          onNext={() => handleStepSubmit(data.personalization as any)}
        />
      )}

      {current_step === 6 && (
        <Step6Welcome
          ninaMessage={nina_message}
          onFinish={() => completeOnboarding(data.personalization || {})}
        />
      )}
    </OnboardingLayout>
  );
};

export default OnboardingPage;