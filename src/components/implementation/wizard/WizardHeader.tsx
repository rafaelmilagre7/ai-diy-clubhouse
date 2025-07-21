
import React from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Solution } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface WizardHeaderProps {
  solution: Solution;
  progressPercentage: number;
  onBack: () => void;
  onComplete: () => void;
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  solution,
  progressPercentage,
  onBack,
  onComplete
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back button and title */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            
            <div className="hidden md:block w-px h-8 bg-neutral-300" />
            
            <div>
              <h1 className="text-xl font-bold text-neutral-800 truncate max-w-md">
                {solution.title}
              </h1>
              <p className="text-sm text-neutral-500">
                Guia de Implementação
              </p>
            </div>
          </div>

          {/* Right: Progress and complete button */}
          <div className="flex items-center space-x-6">
            {/* Progress indicator */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-700">
                  Progresso do Conteúdo
                </p>
                <p className="text-xs text-neutral-500">
                  {Math.round(progressPercentage)}% disponível
                </p>
              </div>
              
              <div className="w-32">
                <Progress 
                  value={progressPercentage} 
                  className="h-2"
                />
              </div>
            </div>

            {/* Complete button */}
            <Button
              onClick={onComplete}
              className="flex items-center gap-2 bg-viverblue hover:bg-viverblue-dark text-white"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="hidden sm:inline">Concluir</span>
            </Button>
          </div>
        </div>

        {/* Mobile progress bar */}
        <div className="md:hidden mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600">
              Conteúdo Disponível
            </span>
            <span className="text-sm text-neutral-500">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>
    </div>
  );
};
