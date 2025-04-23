
import React from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SolutionMobileActionsProps {
  solutionId: string;
  progress: any | null;
  startImplementation: () => Promise<void>;
  continueImplementation: () => Promise<void>;
  initializing: boolean;
  completionPercentage?: number;
}

export const SolutionMobileActions = ({
  solutionId,
  progress,
  startImplementation,
  continueImplementation,
  initializing,
  completionPercentage = 0
}: SolutionMobileActionsProps) => {
  const navigate = useNavigate();
  
  // Handler para o botão de implementação
  const handleImplementation = async () => {
    if (progress?.is_completed) {
      navigate(`/implement/${solutionId}/0`);
    } else if (progress) {
      await continueImplementation();
    } else {
      await startImplementation();
    }
  };
  
  return (
    <div className="mt-8 sm:hidden">
      {progress?.is_completed ? (
        <div className="space-y-3">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700" 
            onClick={() => navigate(`/implementation/${solutionId}/completed`)}
          >
            <Award className="mr-2 h-5 w-5" />
            Ver Certificado
          </Button>
          <Button 
            className="w-full"
            variant="outline" 
            onClick={handleImplementation}
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            Revisar Implementação
          </Button>
        </div>
      ) : (
        <Button 
          className="w-full" 
          onClick={handleImplementation} 
          disabled={initializing}
        >
          <PlayCircle className="mr-2 h-5 w-5" />
          {initializing ? 'Preparando...' : 'Implementar solução'}
          {completionPercentage > 0 && ` (${completionPercentage}%)`}
        </Button>
      )}
    </div>
  );
};
