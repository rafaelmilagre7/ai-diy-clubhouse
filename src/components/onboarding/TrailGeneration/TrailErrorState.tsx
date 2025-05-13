
import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrailErrorStateProps {
  onRegenerate: () => void;
  onForceRefresh: () => void;
  onGoBack: () => void;
  onResetData: () => void;
  errorDetails?: string;
  loadingTimeout?: boolean;
  attemptCount: number;
}

export const TrailErrorState: React.FC<TrailErrorStateProps> = ({
  onRegenerate,
  onForceRefresh,
  onGoBack,
  onResetData,
  errorDetails,
  loadingTimeout,
  attemptCount
}) => {
  // Determinar a mensagem com base no tipo de erro
  const getErrorMessage = () => {
    if (loadingTimeout) {
      return "A geração da trilha está demorando mais que o esperado. Nosso servidor pode estar sobrecarregado no momento.";
    } else if (attemptCount > 2) {
      return "Encontramos problemas repetidos ao tentar gerar sua trilha. Pode haver um problema com os dados fornecidos.";
    } else {
      return "Não foi possível gerar sua trilha personalizada. Por favor, tente novamente.";
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-gradient-to-br from-red-900/20 to-[#151823] border border-red-900/30 p-8 rounded-2xl shadow-lg flex flex-col items-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 mb-4">
          {loadingTimeout ? (
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          ) : (
            <AlertCircle className="h-8 w-8 text-red-500" />
          )}
        </div>
        
        <div className="text-center space-y-3 mb-6">
          <h3 className="text-xl font-semibold text-neutral-100">
            {loadingTimeout ? "Tempo limite excedido" : "Erro ao gerar trilha"}
          </h3>
          <p className="text-neutral-400">{getErrorMessage()}</p>
          
          {errorDetails && (
            <div className="mt-4 p-3 bg-red-900/10 border border-red-900/20 rounded-md text-left">
              <p className="text-sm text-neutral-300 mb-1 font-medium">Detalhes do erro:</p>
              <p className="text-xs text-neutral-400 font-mono">{errorDetails}</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
          {loadingTimeout ? (
            <Button
              onClick={onForceRefresh}
              className="bg-gradient-to-r from-[#0ABAB5] to-[#34D399] hover:from-[#0ABAB5]/90 hover:to-[#34D399]/90 col-span-1 sm:col-span-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          ) : (
            <Button
              onClick={onRegenerate}
              className="bg-gradient-to-r from-[#0ABAB5] to-[#34D399] hover:from-[#0ABAB5]/90 hover:to-[#34D399]/90"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerar Trilha
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={onGoBack}
            className="border-neutral-700 hover:border-neutral-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          {attemptCount > 2 && (
            <Button
              variant="outline"
              onClick={onResetData}
              className="col-span-1 sm:col-span-2 mt-1 border-amber-700/50 text-amber-500 hover:border-amber-700"
            >
              Limpar dados e recomeçar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
