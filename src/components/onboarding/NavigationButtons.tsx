
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface NavigationButtonsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  isSubmitting?: boolean;
  isLastStep?: boolean;
  showBack?: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onPrevious,
  onNext,
  isSubmitting = false,
  isLastStep = false,
  showBack = true
}) => {
  return (
    <div className="flex justify-between mt-6 pt-4 border-t border-white/10">
      {showBack && onPrevious ? (
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isSubmitting}
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
        {isSubmitting ? (
          <>Processando...</>
        ) : (
          <>
            <span>{isLastStep ? 'Finalizar' : 'Continuar'}</span>
            <ArrowRight size={16} />
          </>
        )}
      </Button>
    </div>
  );
};
