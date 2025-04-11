
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ModuleNavigationProps {
  selectedModuleIndex: number;
  totalModules: number;
  onNavigate: (direction: 'next' | 'prev') => void;
  onBackToList: () => void;
}

const ModuleNavigation: React.FC<ModuleNavigationProps> = ({
  selectedModuleIndex,
  totalModules,
  onNavigate,
  onBackToList
}) => {
  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" onClick={onBackToList}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar para lista de módulos
      </Button>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={() => onNavigate('prev')}
          disabled={selectedModuleIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Badge variant="outline" className="px-3 py-1">
          Módulo {selectedModuleIndex + 1} de {totalModules}
        </Badge>
        <Button 
          variant="outline" 
          onClick={() => onNavigate('next')}
          disabled={selectedModuleIndex === totalModules - 1}
        >
          Próximo
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ModuleNavigation;
