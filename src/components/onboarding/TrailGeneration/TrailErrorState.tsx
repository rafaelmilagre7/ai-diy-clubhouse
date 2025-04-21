
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface TrailErrorStateProps {
  loadingTimeout: boolean;
  onRegenerate: () => void;
  onForceRefresh: () => void;
  onGoBack: () => void;
}

export const TrailErrorState: React.FC<TrailErrorStateProps> = ({
  loadingTimeout,
  onRegenerate,
  onForceRefresh,
  onGoBack,
}) => (
  <div className="max-w-xl mx-auto mt-8 p-6 bg-amber-50 rounded-lg border border-amber-200 flex flex-col items-center">
    <AlertCircle className="text-amber-500 h-10 w-10 mb-3" />
    <p className="text-gray-700 mb-4 text-center">
      {loadingTimeout
        ? "O carregamento da trilha excedeu o tempo limite. Por favor, tente novamente."
        : "Ocorreu um erro ao carregar sua trilha. Por favor, tente novamente."}
    </p>
    <div className="flex justify-center gap-2">
      <Button
        className="bg-[#0ABAB5] text-white"
        onClick={onRegenerate}
      >
        Gerar Nova Trilha
      </Button>
      <Button
        variant="outline"
        onClick={onForceRefresh}
        className="flex items-center gap-1"
      >
        <RefreshCw className="h-4 w-4" />
        Tentar Novamente
      </Button>
      <Button
        variant="ghost"
        onClick={onGoBack}
      >
        Voltar
      </Button>
    </div>
  </div>
);
