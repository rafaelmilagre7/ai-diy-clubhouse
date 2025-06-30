
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TestTube, Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MockOnboardingWizardContainer, useMockOnboarding } from '@/components/admin/onboarding/MockOnboardingWizardContainer';
import { OnboardingDebugPanel } from '@/components/admin/onboarding/OnboardingDebugPanel';
import { OnboardingStepRenderer } from '@/components/onboarding/components/OnboardingStepRenderer';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';

const stepTitles = [
  'Informações Pessoais',
  'Perfil Empresarial', 
  'Maturidade em IA',
  'Objetivos e Expectativas',
  'Personalização da Experiência',
  'Finalização'
];

const OnboardingPreviewContent = () => {
  const {
    currentStep,
    totalSteps,
    data,
    isLoading,
    hasError,
    validationErrors,
    updateData,
    nextStep,
    prevStep,
    reset,
    simulateError,
    toggleLoading,
    setCurrentStep,
    getFieldError
  } = useMockOnboarding();

  const handleNext = async () => {
    // Simulate async operation
    toggleLoading();
    setTimeout(() => {
      nextStep();
      toggleLoading();
    }, 1000);
  };

  const handlePrev = () => {
    prevStep();
  };

  const handleComplete = async () => {
    // Simulate completion
    toggleLoading();
    setTimeout(() => {
      toggleLoading();
      console.log('Mock onboarding completed!', data);
    }, 1500);
  };

  return (
    <>
      {/* Progress */}
      <div className="mb-6">
        <OnboardingProgress 
          currentStep={currentStep} 
          totalSteps={totalSteps}
          stepTitles={stepTitles}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Onboarding Preview - 3/4 width */}
        <div className="xl:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Preview do Onboarding - Etapa {currentStep}</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <OnboardingStepRenderer
                currentStep={currentStep}
                data={data}
                onUpdateData={updateData}
                onNext={handleNext}
                onPrev={handlePrev}
                onComplete={handleComplete}
                memberType={data.memberType || 'club'}
                validationErrors={validationErrors}
                getFieldError={getFieldError}
                isCompleting={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Debug Panel - 1/4 width */}
        <div className="xl:col-span-1">
          <OnboardingDebugPanel
            currentStep={currentStep}
            totalSteps={totalSteps}
            data={data}
            onReset={reset}
            onSkipToStep={setCurrentStep}
            onSimulateError={simulateError}
            onToggleLoading={toggleLoading}
            isLoading={isLoading}
            hasError={hasError}
          />
        </div>
      </div>
    </>
  );
};

const OnboardingPreview = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Admin
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-blue-500" />
            <h1 className="text-2xl font-bold">Preview do Onboarding</h1>
            <Badge variant="secondary">Protótipo</Badge>
          </div>
        </div>
        
        <p className="text-muted-foreground">
          Ambiente de teste para validar o fluxo do onboarding antes da implementação final.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Modo de Teste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Frontend</div>
            <p className="text-xs text-muted-foreground">Sem integração backend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4 text-green-500" />
              Componentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">6 Etapas</div>
            <p className="text-xs text-muted-foreground">Fluxo completo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TestTube className="h-4 w-4 text-purple-500" />
              Debug
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Ativo</div>
            <p className="text-xs text-muted-foreground">Painel de controle</p>
          </CardContent>
        </Card>
      </div>

      {/* Wrapped Content */}
      <MockOnboardingWizardContainer>
        <OnboardingPreviewContent />
      </MockOnboardingWizardContainer>
    </div>
  );
};

export default OnboardingPreview;
