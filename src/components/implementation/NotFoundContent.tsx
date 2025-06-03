
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const NotFoundContent = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container py-12 max-w-xl mx-auto text-center">
      <h2 className="text-2xl font-semibold mb-4">Solução não encontrada</h2>
      <p className="text-muted-foreground mb-6">
        A solução que você está procurando não existe ou você não tem acesso a ela.
      </p>
      <div className="space-y-2">
        <Button 
          variant="default" 
          onClick={() => navigate("/solucoes")}
          className="w-full sm:w-auto"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Ir para Soluções
        </Button>
      </div>
    </div>
  );
};
