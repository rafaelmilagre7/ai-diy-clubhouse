
import React from 'react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationButtonsProps {
  onPrevious?: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  nextLabel?: string;
  previousLabel?: string;
  showPrevious?: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onPrevious,
  onNext,
  isNextDisabled = false,
  isLoading = false,
  nextLabel = 'Próximo',
  previousLabel = 'Anterior',
  showPrevious = true,
}) => {
  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t">
      {showPrevious && onPrevious ? (
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {previousLabel}
        </Button>
      ) : (
        <div /> // Spacer
      )}

      <Button
        onClick={onNext}
        disabled={isNextDisabled || isLoading}
        className="flex items-center gap-2 min-w-32"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            {nextLabel}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};
