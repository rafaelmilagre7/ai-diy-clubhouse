
import React, { useState } from "react";
import { Solution } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader } from "lucide-react";

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
  const [isCompleted, setIsCompleted] = useState(false);
  
  const handleConfirmComplete = () => {
    onComplete();
    setIsCompleted(true);
  };
  
  if (isCompleted) {
    return (
      <div className="py-8 max-w-2xl mx-auto text-center space-y-6">
        <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold">Parabéns!</h2>
        
        <p className="text-muted-foreground">
          Você concluiu com sucesso a implementação da solução "{solution.title}".
          Esta conquista foi registrada em seu perfil.
        </p>
        
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 mt-6 text-left">
          <h3 className="font-medium text-green-800 mb-2">O que acontece agora:</h3>
          <ul className="space-y-2 text-green-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Você receberá uma certificação por esta implementação</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Esta solução aparecerá no seu histórico de implementações</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Seu progresso foi registrado nas estatísticas do seu perfil</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-8 max-w-2xl mx-auto text-center space-y-6">
      <h2 className="text-2xl font-semibold">Concluir Implementação</h2>
      
      <p className="text-muted-foreground">
        Você chegou à etapa final da implementação da solução "{solution.title}". 
        Ao confirmar abaixo, esta solução será marcada como concluída em seu perfil.
      </p>
      
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mt-6 text-left">
        <h3 className="font-medium text-blue-800 mb-2">Antes de confirmar a conclusão:</h3>
        <ul className="space-y-2 text-blue-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Certifique-se de que implementou todos os passos necessários</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Verifique se todos os itens do checklist foram marcados</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Confirme que a solução está funcionando conforme esperado</span>
          </li>
        </ul>
      </div>
      
      <Button 
        onClick={handleConfirmComplete} 
        disabled={isCompleting} 
        className="mt-8 py-6 px-8 text-lg"
      >
        {isCompleting ? (
          <>
            <Loader className="mr-2 h-5 w-5 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-5 w-5" />
            Confirmar conclusão da implementação
          </>
        )}
      </Button>
    </div>
  );
};
