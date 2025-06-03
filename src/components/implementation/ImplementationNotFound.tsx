
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ImplementationNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container py-12 text-center">
      <h2 className="text-2xl font-semibold mb-4">Implementação não encontrada</h2>
      <p className="text-muted-foreground mb-6">
        A implementação que você está procurando não existe ou foi removida.
      </p>
      <Button 
        variant="outline" 
        onClick={() => navigate("/dashboard")}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar para o Dashboard
      </Button>
    </div>
  );
};
