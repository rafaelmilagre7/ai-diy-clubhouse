
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, CheckCircle } from 'lucide-react';

interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: string;
  syncError: string;
}

interface OnboardingWizardControlsProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
  isLoading?: boolean;
  hasUnsavedChanges?: boolean;
  lastSaved?: Date | null;
  syncStatus?: SyncStatus;
}

export const OnboardingWizardControls: React.FC<OnboardingWizardControlsProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  canProceed,
  isLoading = false,
  hasUnsavedChanges = false,
  lastSaved,
  syncStatus
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between p-6 bg-[#151823] border border-white/10 rounded-xl">
      {/* Botão Voltar */}
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={isFirstStep || isLoading}
        className="flex items-center gap-2 h-10 px-4 bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/30 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar
      </Button>

      {/* Status central */}
      <div className="flex flex-col items-center text-center space-y-1">
        <p className="text-sm font-medium text-neutral-300">
          Etapa {currentStep} de {totalSteps}
        </p>
        
        {hasUnsavedChanges && (
          <p className="text-xs text-amber-400 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Salvando...
          </p>
        )}
        
        {lastSaved && !hasUnsavedChanges && (
          <p className="text-xs text-green-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Salvo
          </p>
        )}
        
        {!canProceed && !isLoading && !hasUnsavedChanges && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
            Complete os campos obrigatórios
          </p>
        )}
      </div>

      {/* Botão Próximo */}
      <Button
        onClick={onNext}
        disabled={!canProceed || isLoading}
        className="flex items-center gap-2 h-10 px-4 bg-viverblue hover:bg-viverblue/90 text-[#0F111A] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isLastStep ? 'Finalizando...' : 'Salvando...'}
          </>
        ) : (
          <>
            {isLastStep ? 'Finalizar' : 'Próximo'}
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
};
