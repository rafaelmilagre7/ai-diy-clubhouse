
import React, { Suspense, lazy } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { Loader2 } from 'lucide-react';
import { AutoSaveFeedback } from '../AutoSaveFeedback';

// Lazy load dos componentes das etapas
const StepQuemEVoce = lazy(() => import('./StepQuemEVoce').then(module => ({ default: module.StepQuemEVoce })));
const StepSeuNegocio = lazy(() => import('./StepSeuNegocio').then(module => ({ default: module.StepSeuNegocio })));
const StepExperienciaIA = lazy(() => import('./StepExperienciaIA').then(module => ({ default: module.StepExperienciaIA })));

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
  lastSaveTime?: number | null;
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepQuemEVoce
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
          <StepSeuNegocio
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
          <StepExperienciaIA
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
    <div className="space-y-6">
      {/* Feedback de auto-save */}
      <div className="flex justify-end">
        <AutoSaveFeedback 
          isSaving={isSaving} 
          lastSaveTime={lastSaveTime}
          hasUnsavedChanges={false}
          isOnline={navigator.onLine}
        />
      </div>

      {/* Conteúdo da etapa */}
      <Suspense fallback={<LoadingFallback />}>
        {renderStep()}
      </Suspense>
    </div>
  );
};
