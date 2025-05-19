
import React from 'react';
import { Button } from '../ui/button';
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
  const isFirstStep = currentStepIdx === 0;
  const isLastStep = currentStepIdx === stepsLength - 1;
  
  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="flex gap-2">
        {Array.from({ length: stepsLength }).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentStepIdx
                ? 'bg-[#0ABAB5]'
                : 'bg-neutral-600'
            } transition-all duration-300`}
          />
        ))}
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={isFirstStep}
          className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!typingFinished || isLastStep}
          className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
        >
          Próximo
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
