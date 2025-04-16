
import React from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SolutionMobileActionsProps {
  solutionId: string;
  progress: any | null;
  startImplementation: () => void;
  continueImplementation: () => void;
  initializing: boolean;
}

export const SolutionMobileActions = ({
  solutionId,
  progress,
  startImplementation,
  continueImplementation,
  initializing
}: SolutionMobileActionsProps) => {
  const navigate = useNavigate();
  
  // Fixed module count to 6
  const totalModules = 6;
  
  return (
    <div className="mt-8 sm:hidden">
      {progress?.is_completed ? (
        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate(`/implement/${solutionId}/5`)}>
          Solução Implementada com Sucesso!
        </Button>
      ) : progress ? (
        <Button className="w-full" onClick={continueImplementation} disabled={initializing}>
          <PlayCircle className="mr-2 h-5 w-5" />
          Continuar Implementação ({Math.round((progress.current_module / totalModules) * 100)}%)
        </Button>
      ) : (
        <Button className="w-full" onClick={startImplementation} disabled={initializing}>
          <PlayCircle className="mr-2 h-5 w-5" />
          {initializing ? 'Preparando...' : 'Iniciar Implementação Guiada'}
        </Button>
      )}
    </div>
  );
};
