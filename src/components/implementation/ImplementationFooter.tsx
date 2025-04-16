
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle, Eye } from "lucide-react";
import { KeyboardShortcuts } from "./KeyboardShortcuts";

interface ImplementationFooterProps {
  moduleIdx: number;
  modulesLength: number;
  completedModules: number[];
  handlePrevious: () => void;
  handleComplete: () => void;
  handleMarkAsCompleted: () => void;
  isCompleting: boolean;
  hasInteracted: boolean;
}

export const ImplementationFooter = ({
  moduleIdx,
  modulesLength,
  completedModules,
  handlePrevious,
  handleComplete,
  handleMarkAsCompleted,
  isCompleting = false,
  hasInteracted = false
}: ImplementationFooterProps) => {
  const isLastModule = moduleIdx >= modulesLength - 1;
  const isModuleCompleted = completedModules.includes(moduleIdx);
  
  return (
    <div className="sticky bottom-0 bg-white border-t py-4 mt-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="container flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={handlePrevious} 
          className="flex-1 sm:flex-initial"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          {moduleIdx > 0 ? 'Anterior' : 'Voltar para detalhes'}
        </Button>
        
        <KeyboardShortcuts />
        
        {isLastModule ? (
          <Button 
            onClick={handleMarkAsCompleted} 
            className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-initial"
            disabled={isCompleting || !hasInteracted || isModuleCompleted}
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            {isCompleting ? (
              <>Confirmando implementação...</>
            ) : isModuleCompleted ? (
              <>Implementação já confirmada</>
            ) : (
              <>Confirmar Implementação Completa</>
            )}
          </Button>
        ) : (
          <div className="flex flex-1 sm:flex-initial gap-2">
            {isModuleCompleted ? (
              <Button 
                variant="outline" 
                className="flex-1"
                disabled
              >
                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                Módulo concluído
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleMarkAsCompleted} 
                className="flex-1"
                disabled={!hasInteracted}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Marcar como Concluído
              </Button>
            )}
            
            <Button 
              onClick={handleComplete} 
              className="bg-viverblue hover:bg-viverblue/90 flex-1"
            >
              {isModuleCompleted ? (
                <>
                  <Eye className="mr-2 h-5 w-5" />
                  Visualizar próximo
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
