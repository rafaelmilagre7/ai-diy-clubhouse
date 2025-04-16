
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export const NotFoundContent = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-white p-8 rounded-lg shadow-sm max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Solução não encontrada</h2>
        <p className="text-muted-foreground mb-6">
          A solução ou módulo que você está procurando não existe ou não está disponível.
        </p>
        <Button 
          variant="outline" 
          onClick={() => navigate("/dashboard")}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar para o Dashboard
        </Button>
      </div>
    </div>
  );
};
