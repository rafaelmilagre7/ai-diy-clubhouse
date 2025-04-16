
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ActionButtonsProps {
  solutionId: string | null;
  handleViewSolution: () => void;
}

/**
 * Componente de botões de ação para a seção de publicação
 * Permite visualizar a solução antes de publicá-la
 * O botão é desabilitado caso não exista um ID de solução
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  solutionId, 
  handleViewSolution
}) => {
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
    </>
  );
};

export default ActionButtons;
