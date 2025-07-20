
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
      navigate(`/implement/${solutionId}/0`);
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
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 shadow-lg hover:shadow-green-500/25 transition-all duration-300" 
            onClick={() => navigate(`/solution/${solutionId}/certificate`)}
          >
            <Award className="mr-2 h-5 w-5" />
            Ver Certificado
          </Button>
          <Button 
            className="w-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300"
            variant="outline" 
            onClick={handleImplementation}
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            Revisar Implementação
          </Button>
        </div>
      ) : (
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-lg hover:shadow-purple-500/25 transition-all duration-300" 
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
