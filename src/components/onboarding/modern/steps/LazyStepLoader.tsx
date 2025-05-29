
import React, { Suspense, lazy } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { Loader2 } from 'lucide-react';
import { AutoSaveFeedback } from '../AutoSaveFeedback';
import { EnhancedOnboardingStep } from '../EnhancedOnboardingStep';

// Lazy load dos componentes das etapas
const StepQuemEVoceNew = lazy(() => import('./StepQuemEVoceNew').then(module => ({ default: module.StepQuemEVoceNew })));
const StepSeuNegocioNew = lazy(() => import('./StepSeuNegocioNew').then(module => ({ default: module.StepSeuNegocioNew })));
const StepExperienciaIANew = lazy(() => import('./StepExperienciaIANew').then(module => ({ default: module.StepExperienciaIANew })));

interface LazyStepLoaderProps {
  step: number;
  data: QuickOnboardingData;
  onUpdate: (field: keyof QuickOnboardingData, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
  currentStep: number;
  totalSteps: number;
  isSaving?: boolean;
  lastSaveTime?: Date | null;
}

export const LazyStepLoader: React.FC<LazyStepLoaderProps> = ({
  step,
  data,
  onUpdate,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
  totalSteps,
  isSaving,
  lastSaveTime
}) => {
  const LoadingFallback = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="h-8 w-8 text-viverblue animate-spin" />
      <p className="text-gray-300">Carregando etapa...</p>
    </div>
  );

  const getStepConfig = () => {
    switch (step) {
      case 1:
        return {
          title: 'Quem é você?',
          subtitle: 'Vamos começar conhecendo você melhor'
        };
      case 2:
        return {
          title: 'Sobre seu negócio',
          subtitle: 'Conte-nos sobre sua empresa e mercado'
        };
      case 3:
        return {
          title: 'Experiência com IA',
          subtitle: 'Qual sua relação atual com inteligência artificial?'
        };
      default:
        return {
          title: 'Configuração',
          subtitle: 'Configurando sua experiência'
        };
    }
  };

  const stepConfig = getStepConfig();

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <StepQuemEVoceNew
            data={data}
            onUpdate={onUpdate}
            onNext={onNext}
            canProceed={canProceed}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        );
      
      case 2:
        return (
          <StepSeuNegocioNew
            data={data}
            onUpdate={onUpdate}
            onNext={onNext}
            onPrevious={onPrevious}
            canProceed={canProceed}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        );
      
      case 3:
        return (
          <StepExperienciaIANew
            data={data}
            onUpdate={onUpdate}
            onNext={onNext}
            onPrevious={onPrevious}
            canProceed={canProceed}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <EnhancedOnboardingStep
      title={stepConfig.title}
      subtitle={stepConfig.subtitle}
      currentStep={currentStep}
      totalSteps={totalSteps}
      canProceed={canProceed}
      onNext={onNext}
      onPrevious={currentStep > 1 ? onPrevious : undefined}
      isLoading={isSaving}
    >
      {/* Feedback de auto-save discreto no canto superior direito */}
      <div className="absolute top-4 right-4 z-10">
        <AutoSaveFeedback 
          isSaving={isSaving} 
          lastSaveTime={lastSaveTime}
        />
      </div>

      {/* Conteúdo da etapa */}
      <Suspense fallback={<LoadingFallback />}>
        {renderStepContent()}
      </Suspense>
    </EnhancedOnboardingStep>
  );
};
