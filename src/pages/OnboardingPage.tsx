import React, { useCallback } from 'react';
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
    setState,
  } = useOnboarding();

  // Memoizar todas as funções onDataChange ANTES das condicionais
  const handleStep1DataChange = useCallback((personalData: any) => {
    console.log('[STEP1] Dados alterados:', personalData);
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        personal_info: personalData
      }
    }));
  }, []); // REMOVIDO setState da dependência

  const handleStep2DataChange = useCallback((businessData: any) => {
    console.log('Step2 Data Change:', businessData);
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        professional_info: businessData
      }
    }));
  }, []); // REMOVIDO setState da dependência

  const handleStep3DataChange = useCallback((aiData: any) => {
    console.log('Step3 Data Change (só ao sair):', aiData);
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
    console.log('Step4 Data Change:', goalsData);
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        goals_info: goalsData
      }
    }));
  }, []); // REMOVIDO setState da dependência

  const handleStep5DataChange = useCallback((personalizationData: any) => {
    console.log('Step5 Data Change:', personalizationData);
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        personalization: personalizationData
      }
    }));
  }, []); // REMOVIDO setState da dependência

  const handleNext = useCallback(async () => {
    console.log('[ONBOARDING_PAGE] HandleNext chamado, step atual:', current_step);
    
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
      
      if (current_step === 5) {
        console.log('[ONBOARDING_PAGE] Step 5 → Step 6: ir para tela de boas-vindas...');
        // Não finalizar ainda, apenas ir para step 6
      }
    }
    
    if (current_step < 6) {
      await goToNextStep();
    }
  }, [current_step, data, saveStepData, completeOnboarding, goToNextStep]);

  const canProceed = useCallback(() => {
    switch (current_step) {
      case 1:
        console.log('🔍 [ONBOARDING] Verificando se pode avançar step 1:', {
          data: data.personal_info,
          hasName: !!data.personal_info?.name,
          hasPhone: !!data.personal_info?.phone,
          hasState: !!data.personal_info?.state,
          hasCity: !!data.personal_info?.city,
          hasPhoto: !!data.personal_info?.profile_picture
        });
        
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
        console.log('🔍 [ONBOARDING] Resultado validação step 1:', {
          hasRequiredFields,
          phoneValid,
          hasProfilePicture,
          canAdvance
        });
        
        return canAdvance;
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
  }, [current_step, data]);

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

  const currentStepConfig = stepConfig[current_step as keyof typeof stepConfig] || stepConfig[1];

  // Função para renderizar o componente do step atual
  const renderCurrentStep = () => {
    switch (current_step) {
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
            initialData={data.professional_info}
            onDataChange={handleStep2DataChange}
            onNext={() => {}}
          />
        );
      case 3:
        return (
          <Step3AIExperience
            initialData={data.ai_experience}
            onDataChange={handleStep3DataChange}
            onNext={() => {}}
          />
        );
      case 4:
        return (
          <Step4Goals
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
          />
        );
      case 6:
        return (
          <Step6Welcome
            ninaMessage={nina_message}
            onFinish={async () => {
              console.log('[ONBOARDING_PAGE] Step6Welcome onFinish chamado - finalizando onboarding');
              const success = await completeOnboarding(data.personalization);
              console.log('[ONBOARDING_PAGE] Resultado do completeOnboarding:', success);
              // Redirecionamento será feito pelo próprio hook completeOnboarding
            }}
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
      onPrevious={current_step > 1 ? goToPrevStep : undefined}
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