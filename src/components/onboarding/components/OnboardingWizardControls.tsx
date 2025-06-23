
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

export const OnboardingWizardControls = ({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  canProceed,
  isLoading = false,
  hasUnsavedChanges = false,
  lastSaved,
  syncStatus
}: OnboardingWizardControlsProps) => {
  const isLastStep = currentStep === totalSteps;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col space-y-4"
    >
      {/* Status de sincronização */}
      {syncStatus?.syncError && (
        <Alert variant="destructive">
          <AlertDescription>
            Erro na sincronização: {syncStatus.syncError}
          </AlertDescription>
        </Alert>
      )}

      {/* Controles principais */}
      <div className="flex items-center justify-between p-4 bg-[#151823] border border-white/10 rounded-xl">
        {/* Botão Voltar */}
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={currentStep === 1 || isLoading}
          size="sm"
          className="flex items-center gap-2 h-10 px-4 bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/30 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </Button>

        {/* Info central */}
        <div className="hidden sm:flex flex-col items-center text-center space-y-1">
          <p className="text-xs font-medium text-neutral-300">
            Etapa {currentStep} de {totalSteps}
          </p>
          
          {/* Status de validação */}
          {!canProceed && !isLoading && (
            <motion.p 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full"
            >
              Complete os campos obrigatórios
            </motion.p>
          )}
          
          {/* Status de carregamento */}
          {isLoading && (
            <p className="text-xs text-viverblue">
              {isLastStep ? 'Finalizando...' : 'Salvando...'}
            </p>
          )}
          
          {/* Status de sincronização */}
          {syncStatus?.isSyncing && (
            <p className="text-xs text-yellow-400">
              Sincronizando dados...
            </p>
          )}
          
          {/* Última sincronização */}
          {lastSaved && !hasUnsavedChanges && !isLoading && (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle className="w-3 h-3" />
              Salvo há {Math.round((Date.now() - lastSaved.getTime()) / 1000)}s
            </div>
          )}
        </div>

        {/* Botão Próximo/Finalizar */}
        <Button
          onClick={onNext}
          disabled={!canProceed || isLoading}
          size="sm"
          className="flex items-center gap-2 h-10 px-4 bg-viverblue hover:bg-viverblue/90 text-[#0F111A] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isLastStep ? 'Finalizando...' : 'Salvando...'}
            </>
          ) : (
            <>
              {isLastStep ? 'Finalizar Onboarding' : 'Próximo'}
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {/* Aviso sobre mudanças não salvas */}
      {hasUnsavedChanges && !isLoading && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-center"
        >
          <p className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 rounded-lg">
            Você tem alterações não salvas
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
