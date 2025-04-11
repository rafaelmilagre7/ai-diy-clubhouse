
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

interface ImplementationFooterProps {
  moduleIdx: number;
  modulesLength: number;
  handlePrevious: () => void;
  handleComplete: () => void;
}

export const ImplementationFooter = ({
  moduleIdx,
  modulesLength,
  handlePrevious,
  handleComplete
}: ImplementationFooterProps) => {
  return (
    <div className="sticky bottom-0 bg-background border-t py-4 mt-8">
      <div className="container flex justify-between">
        <Button variant="outline" onClick={handlePrevious}>
          <ChevronLeft className="mr-2 h-5 w-5" />
          {moduleIdx > 0 ? 'Anterior' : 'Voltar para detalhes'}
        </Button>
        
        {moduleIdx < modulesLength - 1 ? (
          <Button onClick={handleComplete}>
            Próximo
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="mr-2 h-5 w-5" />
            Concluir Implementação
          </Button>
        )}
      </div>
    </div>
  );
};
