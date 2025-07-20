import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, PlayCircle } from "lucide-react";

interface SolutionMobileActionsProps {
  solutionId: string;
  progress: any;
  startImplementation: () => Promise<any>;
  continueImplementation: () => Promise<void>;
  initializing: boolean;
}

export const SolutionMobileActions = ({ 
  solutionId, 
  progress, 
  startImplementation, 
  continueImplementation, 
  initializing 
}: SolutionMobileActionsProps) => {
  return (
    <div className="md:hidden mt-8">
      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl shadow-2xl">
        {/* Subtle dots pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none rounded-xl">
          <div className="absolute inset-0 rounded-xl" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
            backgroundSize: '15px 15px'
          }} />
        </div>
        
        <div className="relative">
          {progress ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-300">Progresso</span>
                <span className="text-sm font-medium text-viverblue-light">{Math.round(progress.progress_percentage)}%</span>
              </div>
              
              <div className="w-full bg-neutral-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-viverblue to-viverblue-dark h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress.progress_percentage}%` }}
                />
              </div>
              
              <Button
                onClick={continueImplementation}
                disabled={initializing}
                className="w-full bg-gradient-to-r from-viverblue to-viverblue-dark hover:from-viverblue-light hover:to-viverblue text-white border-0 shadow-lg hover:shadow-viverblue/20 transition-all duration-300"
              >
                {initializing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Continuar Implementação
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              onClick={startImplementation}
              disabled={initializing}
              className="w-full bg-gradient-to-r from-viverblue to-viverblue-dark hover:from-viverblue-light hover:to-viverblue text-white border-0 shadow-lg hover:shadow-viverblue/20 transition-all duration-300"
            >
              {initializing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Começar Implementação
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
