
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, Save, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingWizardControlsProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => Promise<void>;
  onPrev: () => void;
  canProceed: boolean;
  isLoading?: boolean;
  hasUnsavedChanges?: boolean;
  lastSaved?: Date | null;
  syncStatus?: {
    isSyncing: boolean;
    lastSyncTime: string | null;
    syncError: string | null;
  };
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
  const formatLastSaved = (date: Date | null) => {
    if (!date) return null;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Salvo agora';
    if (minutes === 1) return 'Salvo há 1 minuto';
    if (minutes < 60) return `Salvo há ${minutes} minutos`;
    
    return `Salvo às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 p-6 bg-[#151823]/60 backdrop-blur-sm border border-white/10 rounded-xl"
    >
      {/* Status de salvamento */}
      {(hasUnsavedChanges || lastSaved || syncStatus?.isSyncing) && (
        <div className="mb-4 flex items-center justify-center gap-2 text-sm">
          {syncStatus?.isSyncing ? (
            <div className="flex items-center gap-2 text-viverblue">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Salvando automaticamente...</span>
            </div>
          ) : hasUnsavedChanges ? (
            <div className="flex items-center gap-2 text-amber-400">
              <Save className="w-4 h-4" />
              <span>Alterações não salvas</span>
            </div>
          ) : lastSaved ? (
            <div className="flex items-center gap-2 text-emerald-400">
              <Clock className="w-4 h-4" />
              <span>{formatLastSaved(lastSaved)}</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Controles de navegação */}
      <div className="flex items-center justify-between">
        {/* Botão Voltar */}
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={currentStep === 1 || isLoading}
          size="lg"
          className="flex items-center gap-2 h-11 px-6 bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </Button>

        {/* Info central */}
        <div className="hidden sm:flex flex-col items-center text-center space-y-2">
          <p className="text-sm font-medium text-slate-200">
            Etapa {currentStep} de {totalSteps}
          </p>
          {!canProceed && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full"
            >
              Complete os campos obrigatórios
            </motion.div>
          )}
          {isLoading && (
            <p className="text-xs text-viverblue">
              Processando suas informações...
            </p>
          )}
        </div>

        {/* Botão Próximo */}
        <Button
          onClick={onNext}
          disabled={!canProceed || isLoading}
          size="lg"
          className="flex items-center gap-2 h-11 px-6 bg-gradient-to-r from-viverblue to-viverblue-light hover:from-viverblue-dark hover:to-viverblue text-[#0F111A] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-viverblue/25"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              {currentStep === totalSteps ? 'Finalizar Configuração' : 'Próxima Etapa'}
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {/* Indicador de progresso mobile */}
      <div className="sm:hidden mt-4">
        <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
          <span>Progresso</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-viverblue to-viverblue-light"
          />
        </div>
        {!canProceed && !isLoading && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-red-400 mt-2 text-center"
          >
            Complete os campos obrigatórios para continuar
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};
