
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActionButtonsProps {
  solutionId: string | null;
  handleViewSolution: () => void;
  handleTestImplementation: () => void;
}

/**
 * Componente de botões de ação para a seção de publicação
 * Permite visualizar a solução e testar sua implementação
 * Os botões são desabilitados caso não exista um ID de solução
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  solutionId, 
  handleViewSolution, 
  handleTestImplementation 
}) => {
  const navigate = useNavigate();
  
  return (
    <>
      {/* Botão para visualizar detalhes da solução */}
      <Button 
        variant="outline"
        onClick={handleViewSolution}
        disabled={!solutionId}
        className="flex-1"
      >
        <Eye className="h-4 w-4 mr-2" />
        Visualizar Solução
      </Button>
      
      {/* Botão para testar a implementação da solução */}
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
