
import React from "react";
import { Solution } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface ImplementationCompleteProps {
  solution: Solution;
  onComplete: () => void;
  isCompleting: boolean;
}

export const ImplementationComplete = ({ 
  solution, 
  onComplete, 
  isCompleting 
}: ImplementationCompleteProps) => {
  return (
    <div className="py-8 max-w-2xl mx-auto text-center space-y-6">
      <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold">Parabéns!</h2>
      
      <p className="text-muted-foreground">
        Você chegou à etapa final da implementação da solução "{solution.title}". 
        Ao confirmar abaixo, esta solução será marcada como concluída em seu perfil.
      </p>
      
      <div className="bg-green-50 p-6 rounded-lg border border-green-200 mt-6 text-left">
        <h3 className="font-medium text-green-800 mb-2">O que acontece ao concluir:</h3>
        <ul className="space-y-2 text-green-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Esta solução será marcada como concluída em seu perfil</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Você poderá acessar o certificado de conclusão</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Seu progresso será registrado nas estatísticas do seu perfil</span>
          </li>
        </ul>
      </div>
      
      <Button 
        onClick={onComplete} 
        disabled={isCompleting} 
        className="mt-8 py-6 px-8 text-lg"
      >
        <CheckCircle className="mr-2 h-5 w-5" />
        {isCompleting ? "Concluindo..." : "Confirmar conclusão da implementação"}
      </Button>
    </div>
  );
};
