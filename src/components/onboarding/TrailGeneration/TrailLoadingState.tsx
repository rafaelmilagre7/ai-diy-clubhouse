
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface TrailLoadingStateProps {
  attemptCount: number;
  onForceRefresh: () => void;
}

export const TrailLoadingState: React.FC<TrailLoadingStateProps> = ({ 
  attemptCount,
  onForceRefresh
}) => {
  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-16 w-16 text-[#0ABAB5] animate-spin" />
          <p className="text-lg text-gray-700">
            {attemptCount > 1 
              ? `Tentativa ${attemptCount}: Gerando sua trilha personalizada...` 
              : "Gerando sua trilha personalizada..."}
          </p>
          <p className="text-sm text-gray-500 max-w-md text-center">
            Isso pode levar alguns segundos. Estamos analisando suas respostas e criando recomendações específicas para seu negócio.
          </p>
          
          {attemptCount > 1 && (
            <Button
              variant="outline"
              onClick={onForceRefresh}
              className="mt-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Forçar atualização
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
