
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TrailStepperNavigationProps {
  currentStepIdx: number;
  stepsLength: number;
  typingFinished: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const TrailStepperNavigation: React.FC<TrailStepperNavigationProps> = ({
  currentStepIdx,
  stepsLength,
  typingFinished,
  onPrevious,
  onNext
}) => {
  return (
    <div className="flex justify-between items-center pt-4">
      <Button
        onClick={onPrevious}
        disabled={currentStepIdx === 0}
        variant="outline"
        className="flex items-center gap-1 border-white/10 hover:bg-white/5"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>
      
      <div className="text-sm text-neutral-400">
        Solução {currentStepIdx + 1} de {stepsLength}
      </div>
      
      <Button
        onClick={onNext}
        disabled={currentStepIdx >= stepsLength - 1 || !typingFinished}
        className="flex items-center gap-1 bg-gradient-to-r from-[#0ABAB5] to-[#34D399] hover:from-[#0ABAB5]/90 hover:to-[#34D399]/90"
      >
        Próxima
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
