
import React from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle, Award } from "lucide-react";
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
  
  // Handler para o botão de implementação
  const handleImplementation = () => {
    if (progress?.is_completed) {
      navigate(`/solutions/${solutionId}/implementation`);
    } else if (progress) {
      console.log("Mobile: Chamando continueImplementation");
      continueImplementation();
    } else {
      console.log("Mobile: Chamando startImplementation");
      startImplementation();
    }
  };
  
  return (
    <div className="mt-8 sm:hidden">
      {progress?.is_completed ? (
        <div className="space-y-3">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700" 
            onClick={() => navigate(`/solutions/${solutionId}/certificate`)}
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
        </Button>
      )}
    </div>
  );
};
