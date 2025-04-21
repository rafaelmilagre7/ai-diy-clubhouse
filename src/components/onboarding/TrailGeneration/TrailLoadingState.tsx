
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { isApiTimeout } from "@/hooks/implementation/useImplementationTrail.utils";

interface TrailLoadingStateProps {
  onForceRefresh: () => void;
  loadStartTime?: number | null;
  attemptCount?: number;
}

export const TrailLoadingState: React.FC<TrailLoadingStateProps> = ({ 
  onForceRefresh,
  loadStartTime,
  attemptCount = 0
}) => {
  const isLongLoading = attemptCount > 1 || isApiTimeout(loadStartTime, 8000);
  
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]" />
      
      <p className="text-[#0ABAB5] font-medium text-center">
        Carregando sua trilha personalizada...
      </p>
      
      <Button
        variant="outline"
        onClick={onForceRefresh}
        size="sm"
        className="mt-4"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Forçar recarregamento
      </Button>
      
      {isLongLoading && (
        <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-md max-w-md">
          <p className="text-sm font-medium text-amber-800 mb-2">Demorou mais que o esperado?</p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
            <li>O servidor pode estar com sobrecarga momentânea</li>
            <li>Sua conexão com a internet pode estar instável</li>
            <li>Use o botão acima para tentar recarregar</li>
            <li>Se persistir, tente navegar para o Dashboard e voltar</li>
          </ul>
        </div>
      )}
    </div>
  );
};
