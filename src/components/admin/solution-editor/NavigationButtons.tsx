
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
}) => {
  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0}
        className="flex items-center"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Anterior
      </Button>
      
      <Button
        onClick={onNext}
        disabled={currentStep === totalSteps - 1}
        className="flex items-center bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
      >
        Próximo
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

export default NavigationButtons;
