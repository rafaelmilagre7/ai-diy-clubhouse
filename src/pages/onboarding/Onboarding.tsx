
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
    if (!isLoading && data && currentStep !== routeStep) {
      navigate(`/onboarding/${currentStep === 'personal' ? '' : currentStep}`);
    }
  }, [isLoading, data, currentStep, routeStep, navigate]);

  // Verificar se o usuário está autenticado
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#0ABAB5]" />
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
        return <ProfessionalForm data={data} onSubmit={(formData) => saveFormData(formData, 'professional')} isSaving={isSaving} />;
      case 'business-context':
        return <BusinessContextForm data={data} onSubmit={(formData) => saveFormData(formData, 'business-context')} isSaving={isSaving} />;
      case 'business-goals':
        return <BusinessGoalsForm data={data} onSubmit={(formData) => saveFormData(formData, 'business-goals')} isSaving={isSaving} />;
      case 'ai-experience':
        return <AIExperienceForm data={data} onSubmit={(formData) => saveFormData(formData, 'ai-experience')} isSaving={isSaving} />;
      case 'personalization':
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
