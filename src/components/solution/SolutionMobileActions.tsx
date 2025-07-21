
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, PlayCircle } from "lucide-react";

interface SolutionMobileActionsProps {
  solutionId: string;
  progress: any;
  startImplementation: () => Promise<any>;
  continueImplementation: () => Promise<any>;
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
              <div className="text-center">
                <span className="text-sm font-medium text-neutral-300">Progresso</span>
                <div className="bg-viverblue/10 rounded-lg p-3 mt-2 mb-4">
                  <p className="text-viverblue-light font-medium">Em andamento</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Módulo {(progress.current_module || 0) + 1}
                  </p>
                </div>
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
