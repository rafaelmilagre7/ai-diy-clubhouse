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
    loadingMessage,
    saveStepData,
    goToNextStep,
    goToPrevStep,
    completeOnboarding,
    nina_message,
    // Adicionar setState do hook para poder atualizar dados localmente
    setState,
  } = useOnboarding();

  // Redirect se usuário não está logado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect se onboarding já foi completado
  if (user && profile && profile.onboarding_completed === true) {
    console.log("✅ [ONBOARDING] Onboarding já completado - redirecionando para dashboard");
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
    console.log('[ONBOARDING_PAGE] HandleNext chamado, step atual:', current_step);
    
    // Salvar dados do step atual antes de prosseguir
    let stepData = null;
    let stepMapping = {
      1: data.personal_info,
      2: data.professional_info,
      3: data.ai_experience,
      4: data.goals_info,
      5: data.personalization,
    };
    
    if (current_step <= 5) {
      stepData = stepMapping[current_step as keyof typeof stepMapping];
      console.log('[ONBOARDING_PAGE] Salvando dados do step:', current_step, stepData);
      
      const success = await saveStepData(current_step, stepData);
      if (!success) {
        console.error('[ONBOARDING_PAGE] Falha ao salvar step', current_step);
        return;
      }
      
      // Se é o step 5, finalizar onboarding antes de ir para step 6
      if (current_step === 5) {
        console.log('[ONBOARDING_PAGE] Step 5 → Step 6: finalizando onboarding...');
        const onboardingCompleted = await completeOnboarding(stepData);
        if (!onboardingCompleted) {
          console.error('[ONBOARDING_PAGE] Falha ao finalizar onboarding');
          return;
        }
      }
    }
    
    if (current_step === 6) {
      console.log('[ONBOARDING_PAGE] Step 6 - redirecionamento direto ao dashboard');
      // No step 6, apenas redirecionar
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } else {
      await goToNextStep();
    }
  };

  const canProceed = () => {
    switch (current_step) {
      case 1:
        // Validar telefone internacional completo (formato: +dialCode|number) 
        const phoneValid = data.personal_info?.phone && 
          data.personal_info.phone.includes('|') && 
          data.personal_info.phone.startsWith('+') &&
          data.personal_info.phone.split('|')[1] && // Ter número após o |
          data.personal_info.phone.split('|')[1].trim().length > 0; // Número não vazio
        
        const hasRequiredFields = data.personal_info?.name && 
          data.personal_info?.state && 
          data.personal_info?.city;
        
        // Adicionar validação da foto de perfil
        const hasProfilePicture = data.personal_info?.profile_picture && 
          data.personal_info.profile_picture.trim().length > 0;
        
        console.log('[VALIDATION] Phone:', data.personal_info?.phone, 'Valid:', phoneValid);
        console.log('[VALIDATION] Required fields:', hasRequiredFields);
        console.log('[VALIDATION] Profile picture:', data.personal_info?.profile_picture, 'Valid:', hasProfilePicture);
        
        return !!(hasRequiredFields && phoneValid && hasProfilePicture);
      case 2:
        return !!(data.professional_info?.company_name && data.professional_info?.company_sector);
      case 3:
        return !!(data.ai_experience?.experience_level && 
                  data.ai_experience?.implementation_status && 
                  data.ai_experience?.implementation_approach);
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
      loadingMessage={loadingMessage}
      canProceed={canProceed()}
      completedSteps={completed_steps}
    >
      {current_step === 1 && (
        <Step1PersonalInfo
          initialData={data.personal_info}
          onDataChange={(personalData) => {
            console.log('[STEP1] Dados alterados:', personalData);
            // Atualizar estado local sem mutação direta
            setState(prev => ({
              ...prev,
              data: {
                ...prev.data,
                personal_info: personalData
              }
            }));
          }}
          onNext={() => {}} // Não usado - controlado pelo OnboardingLayout
        />
      )}

      {current_step === 2 && (
        <Step2BusinessInfo
          initialData={data.professional_info}
          onDataChange={(businessData) => {
            console.log('Step2 Data Change:', businessData);
            // Atualizar estado local sem mutação direta
            setState(prev => ({
              ...prev,
              data: {
                ...prev.data,
                professional_info: businessData as any
              }
            }));
          }}
          onNext={() => {}} // Não usado - controlado pelo OnboardingLayout
        />
      )}

      {current_step === 3 && (
        <Step3AIExperience
          initialData={data.ai_experience}
          onDataChange={(aiData) => {
            console.log('Step3 Data Change:', aiData);
            // Atualizar estado local sem mutação direta (com cast temporário)
            setState(prev => ({
              ...prev,
              data: {
                ...prev.data,
                ai_experience: aiData as any
              }
            }));
          }}
          onNext={() => {}} // Não usado - controlado pelo OnboardingLayout
        />
      )}

      {current_step === 4 && (
        <Step4Goals
          initialData={data.goals_info}
          onDataChange={(goalsData) => {
            console.log('Step4 Data Change:', goalsData);
            // Atualizar estado local sem mutação direta (com cast temporário)
            setState(prev => ({
              ...prev,
              data: {
                ...prev.data,
                goals_info: goalsData as any
              }
            }));
          }}
          onNext={() => {}} // Não usado - controlado pelo OnboardingLayout
        />
      )}

      {current_step === 5 && (
        <Step5Personalization
          initialData={data.personalization}
          onDataChange={(personalizationData) => {
            console.log('Step5 Data Change:', personalizationData);
            // Atualizar estado local sem mutação direta (com cast temporário)
            setState(prev => ({
              ...prev,
              data: {
                ...prev.data,
                personalization: personalizationData as any
              }
            }));
          }}
          onNext={() => {}} // Não usado - controlado pelo OnboardingLayout
        />
      )}

      {current_step === 6 && (
        <Step6Welcome
          ninaMessage={nina_message}
          onFinish={() => {
            console.log('[ONBOARDING_PAGE] Step6Welcome onFinish chamado - redirecionando');
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 500);
          }}
        />
      )}
    </OnboardingLayout>
  );
};

export default OnboardingPage;