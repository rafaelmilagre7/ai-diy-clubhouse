
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { adaptOnboardingStateToQuickData } from '@/types/quickOnboarding';

const StepQuemEVoceNew = React.lazy(() => 
  import('./StepQuemEVoceNew').then(module => ({ default: module.StepQuemEVoceNew }))
);

const StepSeuNegocioNew = React.lazy(() => 
  import('./StepSeuNegocioNew').then(module => ({ default: module.StepSeuNegocioNew }))
);

const StepExperienciaIANew = React.lazy(() => 
  import('./StepExperienciaIANew').then(module => ({ default: module.StepExperienciaIANew }))
);

const StepLoader = () => (
  <div className="flex items-center justify-center py-8">
    <Loader2 className="h-6 w-6 text-viverblue animate-spin" />
  </div>
);

interface LazyStepProps {
  step: number;
  data: any;
  onUpdate: (field: string, value: any) => void;
  onNext: () => void;
  onPrevious?: () => void;
  canProceed: boolean;
  currentStep: number;
  totalSteps: number;
}

export const LazyStepLoader: React.FC<LazyStepProps> = ({ 
  step, 
  data, 
  onUpdate, 
  onNext, 
  onPrevious, 
  canProceed, 
  currentStep, 
  totalSteps 
}) => {
  // Adaptar dados para o formato correto
  const adaptedData = adaptOnboardingStateToQuickData(data);

  return (
    <Suspense fallback={<StepLoader />}>
      {step === 1 && (
        <StepQuemEVoceNew 
          data={adaptedData}
          onUpdate={onUpdate}
          onNext={onNext}
          canProceed={canProceed}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      )}
      {step === 2 && onPrevious && (
        <StepSeuNegocioNew 
          data={adaptedData}
          onUpdate={onUpdate}
          onNext={onNext}
          onPrevious={onPrevious}
          canProceed={canProceed}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      )}
      {step === 3 && onPrevious && (
        <StepExperienciaIANew 
          data={adaptedData}
          onUpdate={onUpdate}
          onNext={onNext}
          onPrevious={onPrevious}
          canProceed={canProceed}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      )}
    </Suspense>
  );
};
