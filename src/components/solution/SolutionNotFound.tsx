
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SolutionNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium">Solução não encontrada</h3>
      <p className="text-muted-foreground mt-1">
        A solução que você está procurando não existe ou foi removida.
      </p>
      <Button 
        variant="link" 
        className="mt-4"
        onClick={() => navigate("/solucoes")}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar para Soluções
      </Button>
    </div>
  );
};
