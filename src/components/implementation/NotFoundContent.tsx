
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const NotFoundContent = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium">Implementação não encontrada</h3>
      <p className="text-muted-foreground mt-1">
        A solução ou módulo que você está procurando não existe ou foi removido.
      </p>
      <Button 
        variant="link" 
        className="mt-4"
        onClick={() => navigate("/dashboard")}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar para o Dashboard
      </Button>
    </div>
  );
};
