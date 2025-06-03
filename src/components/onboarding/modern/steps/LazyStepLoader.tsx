
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

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
  [key: string]: any;
}

export const LazyStepLoader: React.FC<LazyStepProps> = ({ step, ...props }) => {
  return (
    <Suspense fallback={<StepLoader />}>
      {step === 1 && <StepQuemEVoceNew {...props} />}
      {step === 2 && <StepSeuNegocioNew {...props} />}
      {step === 3 && <StepExperienciaIANew {...props} />}
    </Suspense>
  );
};
