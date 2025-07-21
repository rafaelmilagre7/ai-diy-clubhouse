
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, Loader2 } from "lucide-react";

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
  const hasProgress = progress && !progress.is_completed;
  const isCompleted = progress?.is_completed;

  return (
    <div className="md:hidden mt-8 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
      <h3 className="text-lg font-semibold mb-4 text-center bg-gradient-to-r from-white to-viverblue-light bg-clip-text text-transparent">
        Implementação
      </h3>
      
      {isCompleted ? (
        <div className="space-y-3">
          <div className="bg-green-500/10 rounded-lg p-3 text-center">
            <p className="text-green-400 font-medium">✅ Concluída!</p>
          </div>
          <Button
            onClick={() => continueImplementation()}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Ver Implementação
          </Button>
        </div>
      ) : hasProgress ? (
        <div className="space-y-3">
          <div className="bg-viverblue/10 rounded-lg p-3 text-center">
            <p className="text-viverblue-light font-medium">Em andamento</p>
            <p className="text-xs text-viverblue-light/70">
              Módulo {(progress.current_module || 0) + 1}
            </p>
          </div>
          <Button
            onClick={() => continueImplementation()}
            disabled={initializing}
            className="w-full bg-gradient-to-r from-viverblue to-viverblue-dark hover:from-viverblue-light hover:to-viverblue text-white"
          >
            {initializing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4 mr-2" />
                Continuar
              </>
            )}
          </Button>
        </div>
      ) : (
        <Button
          onClick={startImplementation}
          disabled={initializing}
          className="w-full bg-gradient-to-r from-viverblue to-viverblue-dark hover:from-viverblue-light hover:to-viverblue text-white"
        >
          {initializing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Iniciando...
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4 mr-2" />
              Começar
            </>
          )}
        </Button>
      )}
    </div>
  );
};
