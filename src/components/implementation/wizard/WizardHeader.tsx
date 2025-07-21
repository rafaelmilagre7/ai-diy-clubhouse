
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Solution } from "@/lib/supabase";

interface WizardHeaderProps {
  solution: Solution;
  currentStep: number;
  totalSteps: number;
  progressPercentage: number;
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  solution,
  currentStep,
  totalSteps,
  progressPercentage
}) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(`/solution/${solution.id}`);
  };
  
  return (
    <div className="border-b border-neutral-800 bg-slate-900/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-neutral-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <div className="border-l border-neutral-700 pl-4">
              <h1 className="text-lg font-semibold text-white truncate max-w-md">
                {solution.title}
              </h1>
              <p className="text-sm text-neutral-400">
                Implementação Passo a Passo
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                Etapa {currentStep + 1} de {totalSteps}
              </p>
              <p className="text-xs text-neutral-400">
                {Math.round(progressPercentage)}% concluído
              </p>
            </div>
            
            <div className="w-32">
              <Progress 
                value={progressPercentage} 
                className="h-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
