
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { PersonalInfoStep } from './PersonalInfoStep';
import { ProfessionalInfoStep } from './ProfessionalInfoStep';
import { AIExperienceStep } from './AIExperienceStep';
import { NavigationButtons } from '@/components/onboarding/NavigationButtons';
import { AutoSaveFeedback } from '@/components/onboarding/modern/AutoSaveFeedback';

interface LazyStepLoaderProps {
  step: number;
  data: QuickOnboardingData;
  onUpdate: (field: string, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
  currentStep: number;
  totalSteps: number;
  isSaving: boolean;
  lastSaveTime: number | null;
}

const StepLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-viverblue" />
    </div>
  }>
    {children}
  </Suspense>
);

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
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepLoader>
            <PersonalInfoStep data={data} onUpdate={onUpdate} />
          </StepLoader>
        );
      case 2:
        return (
          <StepLoader>
            <ProfessionalInfoStep data={data} onUpdate={onUpdate} />
          </StepLoader>
        );
      case 3:
        return (
          <StepLoader>
            <AIExperienceStep data={data} onUpdate={onUpdate} />
          </StepLoader>
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-400">Etapa não encontrada</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderStep()}
      
      {/* Feedback de salvamento */}
      <div className="flex justify-center">
        <AutoSaveFeedback isSaving={isSaving} lastSaveTime={lastSaveTime} />
      </div>

      {/* Navegação */}
      <NavigationButtons
        onPrevious={currentStep > 1 ? onPrevious : undefined}
        onNext={onNext}
        isSubmitting={isSaving}
        isLastStep={false}
        showPrevious={currentStep > 1}
        submitText={canProceed ? "Continuar" : "Complete os campos obrigatórios"}
        loadingText="Salvando..."
        className="pt-6"
      />
    </div>
  );
};
