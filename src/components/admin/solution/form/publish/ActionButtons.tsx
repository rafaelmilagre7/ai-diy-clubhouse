
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActionButtonsProps {
  solutionId: string | null;
  handleViewSolution: () => void;
  handleTestImplementation: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  solutionId, 
  handleViewSolution, 
  handleTestImplementation 
}) => {
  const navigate = useNavigate();
  
  return (
    <>
      <Button 
        variant="outline"
        onClick={handleViewSolution}
        disabled={!solutionId}
        className="flex-1"
      >
        <Eye className="h-4 w-4 mr-2" />
        Visualizar Solução
      </Button>
      
      <Button 
        onClick={handleTestImplementation}
        disabled={!solutionId}
        className="flex-1 bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
      >
        <Play className="h-4 w-4 mr-2" />
        Testar Implementação
      </Button>
    </>
  );
};

export default ActionButtons;
