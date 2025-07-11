import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { EnhancedButton } from './EnhancedButton';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  isLoading?: boolean;
  nextLabel?: string;
  previousLabel?: string;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onComplete,
  canGoNext = true,
  canGoPrevious = true,
  isLoading = false,
  nextLabel,
  previousLabel
}) => {
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  const getNextButtonText = () => {
    if (nextLabel) return nextLabel;
    if (isLastStep) return "Finalizar Minha Jornada";
    if (currentStep === totalSteps - 1) return "Quase Lá!";
    return "Continuar Descobrindo →";
  };

  const getPreviousButtonText = () => {
    if (previousLabel) return previousLabel;
    return "← Voltar";
  };

  const handleNext = () => {
    if (isLastStep && onComplete) {
      onComplete();
    } else if (onNext) {
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex items-center justify-between pt-8 mt-8 border-t border-slate-700/50"
    >
      {/* Previous Button */}
      <div className="flex-1">
        {!isFirstStep && onPrevious && (
          <EnhancedButton
            variant="ghost"
            size="md"
            icon={ChevronLeft}
            onClick={onPrevious}
            disabled={!canGoPrevious || isLoading}
            className="text-slate-400 hover:text-white"
          >
            {getPreviousButtonText()}
          </EnhancedButton>
        )}
      </div>

      {/* Progress indicator */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i < currentStep
                  ? 'bg-viverblue scale-125'
                  : i === currentStep - 1
                  ? 'bg-viverblue animate-pulse scale-110'
                  : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Next Button */}
      <div className="flex-1 flex justify-end">
        <EnhancedButton
          variant={isLastStep ? "primary" : "secondary"}
          size="lg"
          icon={isLastStep ? Sparkles : ChevronRight}
          onClick={handleNext}
          disabled={!canGoNext}
          loading={isLoading}
          className={isLastStep ? "animate-pulse-glow" : ""}
        >
          {getNextButtonText()}
        </EnhancedButton>
      </div>
    </motion.div>
  );
};