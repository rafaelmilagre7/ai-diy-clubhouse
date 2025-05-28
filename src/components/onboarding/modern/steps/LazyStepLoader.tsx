
import React, { Suspense, lazy } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { Loader2 } from 'lucide-react';
import { AutoSaveFeedback } from '../AutoSaveFeedback';
import { 
  adaptQuickDataToStepQuemEVoce,
  adaptQuickDataToStepSeuNegocio,
  adaptQuickDataToStepExperienciaIA,
  adaptStepQuemEVoceToQuickData,
  adaptStepSeuNegocioToQuickData,
  adaptStepExperienciaIAToQuickData
} from './dataAdapter';

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

  // Função para atualizar dados adaptando de volta para QuickOnboardingData
  const handleStepUpdate = (stepNumber: number) => (field: string, value: any) => {
    // Criar um objeto temporário com o campo atualizado
    const tempStepData = { [field]: value };
    
    let updatedData: Partial<QuickOnboardingData> = {};
    
    switch (stepNumber) {
      case 1:
        const step1Data = { ...adaptQuickDataToStepQuemEVoce(data), ...tempStepData };
        updatedData = adaptStepQuemEVoceToQuickData(step1Data);
        break;
      case 2:
        const step2Data = { ...adaptQuickDataToStepSeuNegocio(data), ...tempStepData };
        updatedData = adaptStepSeuNegocioToQuickData(step2Data);
        break;
      case 3:
        const step3Data = { ...adaptQuickDataToStepExperienciaIA(data), ...tempStepData };
        updatedData = adaptStepExperienciaIAToQuickData(step3Data);
        break;
    }
    
    // Atualizar cada campo individualmente
    Object.entries(updatedData).forEach(([key, val]) => {
      onUpdate(key as keyof QuickOnboardingData, val);
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepQuemEVoce
            data={adaptQuickDataToStepQuemEVoce(data)}
            onUpdate={handleStepUpdate(1)}
            onNext={onNext}
            canProceed={canProceed}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        );
      
      case 2:
        return (
          <StepSeuNegocio
            data={adaptQuickDataToStepSeuNegocio(data)}
            onUpdate={handleStepUpdate(2)}
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
            data={adaptQuickDataToStepExperienciaIA(data)}
            onUpdate={handleStepUpdate(3)}
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
