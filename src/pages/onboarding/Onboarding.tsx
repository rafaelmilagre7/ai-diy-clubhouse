
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import { onboardingSteps, getStepFromRoute } from '@/config/onboardingSteps';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import { Loader2 } from 'lucide-react';
import { PersonalForm } from '@/components/onboarding/forms/PersonalForm';
import { ProfessionalForm } from '@/components/onboarding/forms/ProfessionalForm';
import { BusinessContextForm } from '@/components/onboarding/forms/BusinessContextForm';
import { BusinessGoalsForm } from '@/components/onboarding/forms/BusinessGoalsForm';
import { AIExperienceForm } from '@/components/onboarding/forms/AIExperienceForm';
import { PersonalizationForm } from '@/components/onboarding/forms/PersonalizationForm';
import { ComplementaryForm } from '@/components/onboarding/forms/ComplementaryForm';
import { ReviewStep } from '@/components/onboarding/forms/ReviewStep';
import { useAuth } from '@/contexts/auth';

const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const { isLoading, data, currentStep, saveFormData, completeOnboarding, isSaving } = useOnboarding();
  const location = useLocation();
  const navigate = useNavigate();
  const routeStep = getStepFromRoute(location.pathname);
  
  // Redirecionar para o passo atual se estiver em um passo incorreto
  useEffect(() => {
    // Mapear as rotas antigas para as novas
    const routeMapping: Record<string, string> = {
      'professional': 'professional-data',
      'business-goals': 'club-goals',
      'personalization': 'customization'
    };

    if (!isLoading && data) {
      // Verificar se estamos em uma rota antiga que precisa ser redirecionada
      const pathParts = location.pathname.split('/');
      const currentRouteStep = pathParts[pathParts.length - 1];
      
      if (routeMapping[currentRouteStep]) {
        console.log(`Redirecionando de ${location.pathname} para /onboarding/${routeMapping[currentRouteStep]}`);
        navigate(`/onboarding/${routeMapping[currentRouteStep]}`);
        return;
      }

      // Redirecionar se estivermos em um passo incorreto
      if (currentStep !== routeStep && routeStep !== 'professional') {
        navigate(`/onboarding/${currentStep === 'personal' ? '' : currentStep}`);
      }
    }
  }, [isLoading, data, currentStep, routeStep, navigate, location.pathname]);

  // Verificar se o usuário está autenticado
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-viverblue/5">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-viverblue mx-auto" />
          <p className="mt-4 text-viverblue-dark font-medium">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  // Encontrar o passo atual
  const step = onboardingSteps.find(s => s.id === routeStep) || onboardingSteps[0];
  const stepIndex = onboardingSteps.findIndex(s => s.id === routeStep);
  const progress = ((stepIndex + 1) / onboardingSteps.length) * 100;

  // Renderizar o formulário adequado
  const renderStepForm = () => {
    switch (routeStep) {
      case 'personal':
        return <PersonalForm data={data} onSubmit={(formData) => saveFormData(formData, 'personal')} isSaving={isSaving} />;
      case 'professional':
      case 'professional_data':
        return <ProfessionalForm data={data} onSubmit={(formData) => saveFormData(formData, 'professional_data')} isSaving={isSaving} />;
      case 'business-context':
        return <BusinessContextForm data={data} onSubmit={(formData) => saveFormData(formData, 'business-context')} isSaving={isSaving} />;
      case 'business-goals':
      case 'club-goals':
        return <BusinessGoalsForm data={data} onSubmit={(formData) => saveFormData(formData, 'business-goals')} isSaving={isSaving} />;
      case 'ai-experience':
        return <AIExperienceForm data={data} onSubmit={(formData) => saveFormData(formData, 'ai-experience')} isSaving={isSaving} />;
      case 'personalization':
      case 'customization':
        return <PersonalizationForm data={data} onSubmit={(formData) => saveFormData(formData, 'personalization')} isSaving={isSaving} />;
      case 'complementary':
        return <ComplementaryForm data={data} onSubmit={(formData) => saveFormData(formData, 'complementary')} isSaving={isSaving} />;
      case 'review':
        return <ReviewStep data={data} onComplete={completeOnboarding} isSaving={isSaving} />;
      default:
        return <PersonalForm data={data} onSubmit={(formData) => saveFormData(formData, 'personal')} isSaving={isSaving} />;
    }
  };

  return (
    <OnboardingLayout 
      title={step.title}
      description={step.description}
      currentStep={stepIndex + 1}
      totalSteps={onboardingSteps.length}
      progress={progress}
      steps={onboardingSteps}
      activeStep={routeStep}
    >
      {renderStepForm()}
    </OnboardingLayout>
  );
};

export default Onboarding;
