
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { isApiTimeout } from "@/hooks/implementation/useImplementationTrail.utils";

interface TrailLoadingStateProps {
  attemptCount: number;
  onForceRefresh: () => void;
  loadStartTime: number | null;
}

export const TrailLoadingState: React.FC<TrailLoadingStateProps> = ({ 
  attemptCount, 
  onForceRefresh,
  loadStartTime
}) => {
  const [showTips, setShowTips] = useState(false);
  const [isLongLoading, setIsLongLoading] = useState(false);

  useEffect(() => {
    // Mostrar dicas se já houver múltiplas tentativas
    if (attemptCount > 1) {
      setShowTips(true);
    }

    // Detectar carregamento prolongado (mais de 8 segundos)
    const timer = setTimeout(() => {
      if (loadStartTime && isApiTimeout(loadStartTime, 8000)) {
        setIsLongLoading(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [attemptCount, loadStartTime]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]" />
      <p className="text-[#0ABAB5] font-medium text-center">
        Carregando sua trilha personalizada...
        {isLongLoading && <span className="block text-sm text-gray-600 mt-1">Isso está demorando mais que o esperado.</span>}
      </p>
      
      <div className="flex flex-col items-center mt-2">
        {(attemptCount > 1 || isLongLoading) && (
          <Button
            variant="outline"
            onClick={onForceRefresh}
            size="sm"
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Forçar recarregamento
          </Button>
        )}
        
        {showTips && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Demorou mais que o esperado?</p>
                <ul className="mt-2 text-xs text-gray-700 space-y-1 list-disc pl-4">
                  <li>O servidor pode estar com sobrecarga momentânea</li>
                  <li>Sua conexão com a internet pode estar instável</li>
                  <li>Use o botão acima para tentar recarregar</li>
                  <li>Se persistir, tente navegar para o Dashboard e voltar</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
