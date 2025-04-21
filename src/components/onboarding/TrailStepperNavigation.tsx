
import { Button } from "@/components/ui/button";
import React from "react";
import { useNavigate } from "react-router-dom";

interface TrailStepperNavigationProps {
  currentStepIdx: number;
  stepsLength: number;
  typingFinished: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const TrailStepperNavigation = ({
  currentStepIdx,
  stepsLength,
  typingFinished,
  onPrevious,
  onNext,
}: TrailStepperNavigationProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between mt-4">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStepIdx === 0}
      >
        Anterior
      </Button>
      {currentStepIdx < stepsLength - 1 ? (
        <Button onClick={onNext} disabled={!typingFinished}>
          Próximo
        </Button>
      ) : (
        <Button onClick={() => navigate("/dashboard")}>
          Finalizar e Ir para Dashboard
        </Button>
      )}
    </div>
  );
};
