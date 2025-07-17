import React, { useState } from 'react';
import { useSimpleOnboarding } from '@/hooks/useSimpleOnboarding';
import { Card } from '@/components/ui/card';

// Import dos steps simplificados
import { SimpleStep1 } from './steps/SimpleStep1';
import { SimpleStep2 } from './steps/SimpleStep2';
import { SimpleStep3 } from './steps/SimpleStep3';
import { SimpleStep4 } from './steps/SimpleStep4';
import { SimpleStep5 } from './steps/SimpleStep5';
import { SimpleStep6 } from './steps/SimpleStep6';

const TOTAL_STEPS = 6;
const STEP_TITLES = [
  'Informações Pessoais',
  'Contexto Empresarial', 
  'Experiência com IA',
  'Objetivos',
  'Personalização',
  'Finalização'
];

export const SimpleOnboardingWizardNew: React.FC = () => {
  const { data, isLoading, isSaving, saveStep, completeOnboarding } = useSimpleOnboarding();
  const [currentStep, setCurrentStep] = useState(data.current_step || 1);

  const handleNext = async (stepData: any) => {
    const success = await saveStep(stepData, currentStep);
    if (success && currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return success;
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleComplete = async () => {
    return await completeOnboarding();
  };

  const renderProgressBar = () => {
    return (
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
        />
      </div>
    );
  };

  const renderStep = () => {
    const stepProps = {
      data,
      isLoading: isSaving
    };

    switch (currentStep) {
      case 1:
        return <SimpleStep1 {...stepProps} onNext={handleNext} />;
      case 2:
        return <SimpleStep2 {...stepProps} onNext={handleNext} onPrevious={handlePrevious} />;
      case 3:
        return <SimpleStep3 {...stepProps} onNext={handleNext} onPrevious={handlePrevious} />;
      case 4:
        return <SimpleStep4 {...stepProps} onNext={handleNext} onPrevious={handlePrevious} />;
      case 5:
        return <SimpleStep5 {...stepProps} onNext={handleNext} onPrevious={handlePrevious} />;
      case 6:
        return <SimpleStep6 {...stepProps} onComplete={handleComplete} onPrevious={handlePrevious} />;
      default:
        return <SimpleStep1 {...stepProps} onNext={handleNext} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando seu onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header com progresso */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-muted-foreground">
                  Etapa {currentStep} de {TOTAL_STEPS}
                </h2>
                <h1 className="text-lg font-semibold text-foreground">
                  {STEP_TITLES[currentStep - 1]}
                </h1>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {Math.round((currentStep / TOTAL_STEPS) * 100)}% concluído
                </p>
              </div>
            </div>
            {renderProgressBar()}
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-8">
          {renderStep()}
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Precisa de ajuda? Entre em contato conosco!</p>
      </footer>
    </div>
  );
};