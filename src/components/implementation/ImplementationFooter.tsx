
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { KeyboardShortcuts } from "./KeyboardShortcuts";

interface ImplementationFooterProps {
  moduleIdx: number;
  modulesLength: number;
  handlePrevious: () => void;
  handleComplete: () => void;
  isCompleting: boolean;
}

export const ImplementationFooter = ({
  moduleIdx,
  modulesLength,
  handlePrevious,
  handleComplete,
  isCompleting = false
}: ImplementationFooterProps) => {
  const isLastModule = moduleIdx >= modulesLength - 1;
  
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
            onClick={handleComplete} 
            className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-initial"
            disabled={isCompleting}
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            {isCompleting ? (
              <>Confirmando implementação...</>
            ) : (
              <>Confirmar Implementação Completa</>
            )}
          </Button>
        ) : (
          <div className="flex flex-1 sm:flex-initial gap-2">
            <Button 
              variant="outline" 
              onClick={handleComplete} 
              className="flex-1"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Marcar como Concluído
            </Button>
            <Button 
              onClick={handleComplete} 
              className="bg-viverblue hover:bg-viverblue/90 flex-1"
            >
              Próximo
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
