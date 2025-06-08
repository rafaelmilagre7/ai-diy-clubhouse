
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
      className="flex items-center justify-between p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
    >
      {/* Botão Voltar */}
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={currentStep === 1 || isLoading}
        size="lg"
        className="flex items-center gap-2 h-12 px-6 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar
      </Button>

      {/* Info central redesenhada */}
      <div className="hidden sm:flex flex-col items-center text-center space-y-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Etapa {currentStep} de {totalSteps}
        </p>
        {!canProceed && !isLoading && (
          <motion.p 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full"
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

      {/* Botão Próximo redesenhado */}
      <Button
        onClick={onNext}
        disabled={!canProceed || isLoading}
        size="lg"
        className="flex items-center gap-2 h-12 px-6 bg-gradient-to-r from-viverblue to-viverblue-light hover:from-viverblue-dark hover:to-viverblue text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
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
