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
import { OnboardingDataViewer } from '@/components/debug/OnboardingDataViewer';
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
        // Validar telefone internacional (formato: +dialCode|number)
        const phoneValid = data.personal_info?.phone && 
          data.personal_info.phone.includes('|') && 
          data.personal_info.phone.startsWith('+');
        return !!(data.personal_info?.name && phoneValid && data.personal_info?.state && data.personal_info?.city);
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
            console.log('[STEP1] Dados alterados:', personalData);
            // Salvar automaticamente os dados quando mudarem
            saveStepData(1, personalData);
          }}
          onNext={() => handleNext()}
        />
      )}

      {current_step === 2 && (
        <Step2BusinessInfo
          initialData={data.business_info}
          onDataChange={(businessData) => {
            console.log('Step2 Data Change:', businessData);
            // Criar novo objeto com estrutura correta
            const formattedData = {
              company_name: businessData.company_name || '',
              company_sector: businessData.company_sector || '',
              company_size: businessData.company_size || '',
              annual_revenue: businessData.annual_revenue || '',
              current_position: businessData.current_position || '',
              years_experience: '1-3', // Adicionar campo faltante
            };
            
            // Atualizar dados no formato correto
            if (data.business_info) {
              Object.assign(data.business_info, formattedData);
            } else {
              data.business_info = formattedData;
            }
          }}
          onNext={() => {
            console.log('Step2 Submit:', data.business_info);
            handleStepSubmit(data.business_info || {
              company_name: '',
              company_sector: '',
              company_size: '',
              annual_revenue: '',
              current_position: '',
              years_experience: '1-3',
            });
          }}
        />
      )}

      {current_step === 3 && (
        <Step3AIExperience
          initialData={data.ai_experience}
          onDataChange={(aiData) => {
            console.log('Step3 Data Change:', aiData);
            // Criar novo objeto com estrutura correta
            const formattedData = {
              experience_level: aiData.experience_level || '',
              tools_used: aiData.current_tools || [], // Mapear current_tools -> tools_used
              satisfaction_level: 'satisfied',
              biggest_challenge: aiData.biggest_challenge || '',
            };
            
            // Atualizar dados no formato correto
            if (data.ai_experience) {
              Object.assign(data.ai_experience, formattedData);
            } else {
              data.ai_experience = formattedData;
            }
          }}
          onNext={() => {
            console.log('Step3 Submit:', data.ai_experience);
            handleStepSubmit(data.ai_experience || {
              experience_level: '',
              tools_used: [],
              satisfaction_level: 'satisfied',
              biggest_challenge: '',
            });
          }}
        />
      )}

      {current_step === 4 && (
        <Step4Goals
          initialData={data.goals_info}
          onDataChange={(goalsData) => {
            console.log('Step4 Data Change:', goalsData);
            // Criar novo objeto com estrutura correta
            const formattedData = {
              primary_goal: goalsData.primary_goal || '',
              specific_challenge: goalsData.specific_objectives || '', // Mapear specific_objectives -> specific_challenge
              key_metrics: goalsData.success_metrics?.join(', ') || '', // Mapear success_metrics -> key_metrics
              timeline: goalsData.timeline || '',
              success_definition: 'Implementar IA com sucesso',
            };
            
            // Atualizar dados no formato correto
            if (data.goals_info) {
              Object.assign(data.goals_info, formattedData);
            } else {
              data.goals_info = formattedData;
            }
          }}
          onNext={() => {
            console.log('Step4 Submit:', data.goals_info);
            handleStepSubmit(data.goals_info || {
              primary_goal: '',
              specific_challenge: '',
              key_metrics: '',
              timeline: '',
              success_definition: 'Implementar IA com sucesso',
            });
          }}
        />
      )}

      {current_step === 5 && (
        <Step5Personalization
          initialData={data.personalization}
          onDataChange={(personalizationData) => {
            console.log('Step5 Data Change:', personalizationData);
            // Criar novo objeto com estrutura correta
            const formattedData = {
              study_hours: '2-4',
              preferred_content: personalizationData.preferred_content || [],
              learning_style: personalizationData.learning_style || '',
              support_level: personalizationData.support_level || '',
              schedule_preference: personalizationData.availability || '', // Mapear availability -> schedule_preference
            };
            
            // Atualizar dados no formato correto
            if (data.personalization) {
              Object.assign(data.personalization, formattedData);
            } else {
              data.personalization = formattedData;
            }
          }}
          onNext={() => {
            console.log('Step5 Submit:', data.personalization);
            handleStepSubmit(data.personalization || {
              study_hours: '2-4',
              preferred_content: [],
              learning_style: '',
              support_level: '',
              schedule_preference: '',
            });
          }}
        />
      )}

      {current_step === 6 && (
        <Step6Welcome
          ninaMessage={nina_message}
          onFinish={() => completeOnboarding(data.personalization || {})}
        />
      )}
      
      {/* Debug component - temporário */}
      <OnboardingDataViewer />
    </OnboardingLayout>
  );
};

export default OnboardingPage;