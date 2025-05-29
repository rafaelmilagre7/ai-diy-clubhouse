
import React from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { AutoSaveFeedback } from '../AutoSaveFeedback';
import { EnhancedOnboardingStep } from '../EnhancedOnboardingStep';
import { StepQuemEVoceNew } from './StepQuemEVoceNew';
import { StepSeuNegocioNew } from './StepSeuNegocioNew';
import { StepExperienciaIANew } from './StepExperienciaIANew';

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
  console.log('🔄 LazyStepLoader renderizado:', { step, currentStep, canProceed });

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
    console.log('🎯 Renderizando conteúdo do step:', step);
    
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
        console.log('⚠️ Step não reconhecido:', step);
        return (
          <div className="text-center py-12">
            <p className="text-gray-400">Etapa não encontrada: {step}</p>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {/* Feedback de auto-save discreto no canto superior direito */}
      <div className="absolute top-4 right-4 z-10">
        <AutoSaveFeedback 
          isSaving={isSaving} 
          lastSaveTime={lastSaveTime ? lastSaveTime.getTime() : null}
        />
      </div>

      {/* Conteúdo da etapa */}
      {renderStepContent()}
    </div>
  );
};
