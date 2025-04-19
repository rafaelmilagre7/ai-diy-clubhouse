
import React from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle } from "lucide-react";
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
      navigate(`/implementation/${solutionId}/completed`);
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
        <Button 
          className="w-full bg-green-600 hover:bg-green-700" 
          onClick={() => navigate(`/implementation/${solutionId}/completed`)}
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          Solução Implementada com Sucesso!
        </Button>
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
