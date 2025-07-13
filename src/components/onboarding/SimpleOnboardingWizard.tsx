import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useSimpleOnboarding } from './hooks/useSimpleOnboarding';

// Importar os passos simplificados
import SimpleStep1 from './steps/SimpleStep1';
import SimpleStep2 from './steps/SimpleStep2';
import SimpleStep3 from './steps/SimpleStep3';

export const SimpleOnboardingWizard = () => {
  const { user, profile } = useAuth();
  const { data, isLoading, saveData, completeOnboarding } = useSimpleOnboarding();
  const [currentStep, setCurrentStep] = useState(data.current_step || 1);

  if (isLoading) {
    return <LoadingScreen message="Carregando onboarding..." />;
  }

  // Se já completou, redirecionar para dashboard
  if (profile?.onboarding_completed) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleNext = async () => {
    // Salvar passo atual antes de avançar
    const success = await saveData({ current_step: currentStep + 1 });
    if (success) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      saveData({ current_step: currentStep - 1 });
    }
  };

  const handleComplete = async () => {
    const success = await completeOnboarding();
    if (success) {
      // O redirecionamento será feito automaticamente pelo Navigate acima
      window.location.href = '/dashboard';
    }
  };

  const updateData = (stepData: any) => {
    saveData(stepData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SimpleStep1
            data={data}
            onNext={handleNext}
            onUpdateData={updateData}
          />
        );
      case 2:
        return (
          <SimpleStep2
            data={data}
            onNext={handleNext}
            onPrev={handlePrev}
            onUpdateData={updateData}
          />
        );
      case 3:
        return (
          <SimpleStep3
            data={data}
            onPrev={handlePrev}
            onComplete={handleComplete}
            onUpdateData={updateData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress indicator */}
      <div className="bg-primary/5 border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      step < currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              {currentStep === 1 && 'Informações Essenciais'}
              {currentStep === 2 && 'Contexto Profissional'}
              {currentStep === 3 && 'Finalização'}
            </p>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {renderStep()}
      </div>
    </div>
  );
};