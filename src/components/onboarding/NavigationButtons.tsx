
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface NavigationButtonsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  isSubmitting?: boolean;
  isLastStep?: boolean;
  showBack?: boolean;
  // Novas propriedades
  submitText?: string;
  loadingText?: string;
  showPrevious?: boolean;
  previousDisabled?: boolean;
  className?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onPrevious,
  onNext,
  isSubmitting = false,
  isLastStep = false,
  showBack = true,
  // Novas propriedades com valores padrão
  submitText,
  loadingText,
  showPrevious = showBack,
  previousDisabled = false,
  className = ""
}) => {
  // Usar os textos personalizados ou os valores padrão
  const nextButtonText = isSubmitting 
    ? (loadingText || "Processando...") 
    : (submitText || (isLastStep ? 'Finalizar' : 'Continuar'));

  return (
    <div className={`flex justify-between mt-6 pt-4 border-t border-white/10 ${className}`}>
      {(showPrevious && onPrevious) ? (
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isSubmitting || previousDisabled}
          className="flex items-center gap-2 border-white/20 hover:bg-white/5"
        >
          <ArrowLeft size={16} />
          <span>Voltar</span>
        </Button>
      ) : (
        <div></div>
      )}
      
      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-viverblue hover:bg-viverblue-dark transition-colors flex items-center gap-2"
      >
        <span>{nextButtonText}</span>
        {!isSubmitting && <ArrowRight size={16} />}
      </Button>
    </div>
  );
};
