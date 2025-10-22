import React, { useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useOnboarding } from '@/hooks/onboarding/useOnboarding';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Step0UserType } from '@/components/onboarding/steps/Step0UserType';
import { Step1PersonalInfo } from '@/components/onboarding/steps/Step1PersonalInfo';
import { Step2BusinessInfo } from '@/components/onboarding/steps/Step2BusinessInfo';
import { Step3ExperienceLevel } from '@/components/onboarding/steps/Step3ExperienceLevel';
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
    userType,
    isLoading,
    isSaving,
    loadingMessage,
    saveStepData,
    saveUserType,
    goToNextStep,
    goToPrevStep,
    completeOnboarding,
    nina_message,
    setState,
  } = useOnboarding();

  // Memoizar todas as funções onDataChange ANTES das condicionais
  const handleStep1DataChange = useCallback((personalData: any) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        personal_info: personalData
      }
    }));
  }, []); // REMOVIDO setState da dependência

  const handleStep2DataChange = useCallback((businessData: any) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        professional_info: businessData
      }
    }));
  }, []); // REMOVIDO setState da dependência

  const handleStep3DataChange = useCallback((aiData: any) => {
    // Só atualiza o estado quando receber dados válidos
    if (aiData && Object.keys(aiData).length > 0) {
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          ai_experience: aiData
        }
      }));
    }
  }, []); // REMOVIDO setState da dependência para evitar loop

  const handleStep4DataChange = useCallback((goalsData: any) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        goals_info: goalsData
      }
    }));
  }, []); // REMOVIDO setState da dependência

  const handleStep5DataChange = useCallback((personalizationData: any) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        personalization: personalizationData
      }
    }));
  }, []); // REMOVIDO setState da dependência

  const handleNext = useCallback(async () => {
    // Se estivermos no step 0, não há dados para salvar, apenas avançar
    if (current_step === 0) {
      return;
    }
    
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
      
      const success = await saveStepData(current_step, stepData);
      if (!success) {
        console.error('[ONBOARDING_PAGE] Falha ao salvar step', current_step);
        return;
      }
      
      if (current_step === 5) {
        // Não finalizar ainda, apenas ir para step 6
      }
    }
    
    if (current_step < 6) {
      await goToNextStep();
    }
  }, [current_step, data, saveStepData, goToNextStep]);

  const canProceed = useCallback(() => {
    switch (current_step) {
      case 0:
        // Step 0: sempre pode prosseguir (escolha será feita no componente)
        return true;
      case 1:
        const phoneValid = data.personal_info?.phone && 
          data.personal_info.phone.includes('|') && 
          data.personal_info.phone.startsWith('+') &&
          data.personal_info.phone.split('|')[1] && 
          data.personal_info.phone.split('|')[1].trim().length > 0;
        
        const hasRequiredFields = data.personal_info?.name && 
          data.personal_info?.state && 
          data.personal_info?.city;
        
        // TEMPORARIAMENTE removendo obrigatoriedade da foto para debugar
        const hasProfilePicture = true; // data.personal_info?.profile_picture && 
          // data.personal_info.profile_picture.trim().length > 0;
        
        const canAdvance = !!(hasRequiredFields && phoneValid && hasProfilePicture);
        
        return canAdvance;
      case 2:
        return !!(data.professional_info?.company_name && data.professional_info?.company_sector);
      case 3:
        return !!(data.ai_experience?.experience_level && 
                 (data.ai_experience as any)?.learning_goals?.length > 0 && 
                 (data.ai_experience as any)?.priority_areas?.length > 0 && 
                 (data.ai_experience as any)?.implementation_timeline);
      case 4:
        return !!(data.goals_info?.primary_goal);
      case 5:
        return !!(data.personalization?.learning_style);
      case 6:
        return true;
      default:
        return false;
    }
  }, [current_step, data]);

  // Redirect se usuário não está logado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect se onboarding já foi completado E não está na celebração
  if (user && profile && profile.onboarding_completed === true && current_step !== 6) {
    return <Navigate to="/dashboard" replace />;
  }

  // Loading inicial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-md text-primary" />
          <p className="text-muted-foreground">Carregando seu progresso...</p>
        </div>
      </div>
    );
  }

  const stepConfig = {
    0: {
      title: 'Bem-vindo ao Viver de IA!',
      subtitle: 'Vamos personalizar sua experiência',
      component: Step0UserType,
    },
    1: {
      title: 'Vamos nos conhecer melhor',
      subtitle: 'Conte-nos um pouco sobre você para personalizarmos sua experiência',
      component: Step1PersonalInfo,
    },
    2: {
      title: userType === 'learner' ? 'Contexto profissional' : 'Contexto do seu negócio',
      subtitle: userType === 'learner' 
        ? 'Entenda como podemos ajudar no seu desenvolvimento profissional'
        : 'Entenda como podemos ajudar sua empresa a crescer com IA',
      component: Step2BusinessInfo,
    },
    3: {
      title: userType === 'learner' ? 'Seu nível de conhecimento' : 'Sua experiência com IA',
      subtitle: userType === 'learner' 
        ? 'Vamos adaptar o conteúdo ao seu nível atual'
        : 'Entenda onde você está na jornada de implementação',
      component: Step3ExperienceLevel,
    },
    4: {
      title: 'Seus objetivos',
      subtitle: userType === 'learner'
        ? 'Defina suas metas de aprendizado e carreira'
        : 'Defina suas metas para que possamos criar o melhor plano para você',
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

  const currentStepConfig = stepConfig[current_step as keyof typeof stepConfig] || stepConfig[0];

  // Função para renderizar o componente do step atual
  const renderCurrentStep = () => {
    switch (current_step) {
      case 0:
        return (
          <Step0UserType
            onUserTypeSelect={async (selectedUserType) => {
              const success = await saveUserType(selectedUserType);
              if (!success) {
                console.error('[ONBOARDING_PAGE] Falha ao salvar user type');
              }
            }}
            isLoading={isSaving}
          />
        );
      case 1:
        return (
          <Step1PersonalInfo
            initialData={data.personal_info}
            onDataChange={handleStep1DataChange}
            onNext={() => {}}
          />
        );
      case 2:
        return (
          <Step2BusinessInfo
            userType={userType}
            initialData={data.professional_info}
            onDataChange={handleStep2DataChange}
            onNext={() => {}}
          />
        );
        case 3:
          return (
            <Step3ExperienceLevel 
              initialData={data.ai_experience}
              onDataChange={handleStep3DataChange}
              onNext={() => {}}
              userType={userType || 'entrepreneur'}
            />
          );
      case 4:
        return (
          <Step4Goals
            userType={userType}
            initialData={data.goals_info}
            onDataChange={handleStep4DataChange}
            onNext={() => {}}
          />
        );
      case 5:
        return (
          <Step5Personalization
            initialData={data.personalization}
            onDataChange={handleStep5DataChange}
            onNext={() => {}}
            userType={userType || 'entrepreneur'}
          />
        );
      case 6:
        return (
          <Step6Welcome
            ninaMessage={nina_message}
            userName={data.personal_info?.name || profile?.name || "Usuário"}
            onFinish={async () => {
              // Se já está completo, apenas mostrar celebração e redirecionar
              if (is_completed) {
                return true; 
              }
              
              // Se não está completo, finalizar o processo
              const success = await completeOnboarding(data.personalization);
              return success;
            }}
            userType={userType || 'entrepreneur'}
          />
        );
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout
      currentStep={current_step}
      totalSteps={6}
      title={currentStepConfig.title}
      subtitle={currentStepConfig.subtitle}
      onPrevious={current_step > 0 ? goToPrevStep : undefined}
      onNext={current_step < 6 ? handleNext : undefined}
      nextLabel={current_step === 5 ? 'Ir para boas-vindas' : 'Continuar'}
      isLoading={isSaving}
      loadingMessage={loadingMessage}
      canProceed={canProceed()}
      completedSteps={completed_steps}
    >
      {renderCurrentStep()}
    </OnboardingLayout>
  );
};

export default OnboardingPage;