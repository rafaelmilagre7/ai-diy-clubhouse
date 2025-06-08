
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
  isLoading?: boolean;
}

export const OnboardingNavigation = ({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  canProceed,
  isLoading = false
}: OnboardingNavigationProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-6 bg-[#151823] border border-white/10 rounded-xl"
    >
      {/* Botão Voltar */}
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={currentStep === 1 || isLoading}
        size="lg"
        className="flex items-center gap-2 h-12 px-6 bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/30 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar
      </Button>

      {/* Info central */}
      <div className="hidden sm:flex flex-col items-center text-center space-y-1">
        <p className="text-sm font-medium text-neutral-300">
          Etapa {currentStep} de {totalSteps}
        </p>
        {!canProceed && !isLoading && (
          <motion.p 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full"
          >
            Complete os campos obrigatórios
          </motion.p>
        )}
        {isLoading && (
          <p className="text-xs text-viverblue">
            Salvando suas informações...
          </p>
        )}
      </div>

      {/* Botão Próximo */}
      <Button
        onClick={onNext}
        disabled={!canProceed || isLoading}
        size="lg"
        className="flex items-center gap-2 h-12 px-6 bg-viverblue hover:bg-viverblue-dark text-[#0F111A] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            {currentStep === totalSteps ? 'Finalizar' : 'Próximo'}
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </motion.div>
  );
};
