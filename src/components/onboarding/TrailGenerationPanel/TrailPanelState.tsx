
import React from "react";
import { Loader2, AlertTriangle, RefreshCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrailPanelState({
  isLoading,
  regenerating,
  solutionsLoading,
  refreshing,
  showMagic,
  loadingFailed = false,
  onRegenerate,
  onRefresh
}: {
  isLoading: boolean;
  regenerating: boolean;
  solutionsLoading: boolean;
  refreshing: boolean;
  showMagic: boolean;
  loadingFailed?: boolean;
  onRegenerate: () => void;
  onRefresh: () => void;
}) {
  if (showMagic) return null;

  if (isLoading || regenerating || solutionsLoading || refreshing) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="h-8 w-8 text-[#0ABAB5] animate-spin" />
        <span className="text-[#0ABAB5] font-medium">
          {regenerating ? "Milagrinho está preparando sua trilha personalizada..." : "Carregando dados da trilha..."}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="text-center space-y-2">
        {loadingFailed ? (
          <>
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
            <span className="text-gray-700 block font-medium">Erro ao carregar a trilha personalizada</span>
            <p className="text-sm text-gray-500">
              Ocorreu um problema ao tentar carregar ou gerar sua trilha. Tente novamente ou entre em contato com o suporte.
            </p>
          </>
        ) : (
          <>
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
            <span className="text-gray-600 block">Nenhuma trilha personalizada foi encontrada ou a trilha está vazia.</span>
            <p className="text-sm text-gray-500">Isso pode acontecer se a trilha foi apagada ou se houve um problema no banco de dados.</p>
          </>
        )}
      </div>
      <Button
        onClick={onRegenerate}
        className="bg-[#0ABAB5] text-white"
      >
        Gerar Nova Trilha Personalizada
      </Button>
      <Button
        variant="outline"
        onClick={onRefresh}
        className="flex items-center gap-2"
      >
        <RefreshCcw className="h-4 w-4" />
        Tentar Carregar Novamente
      </Button>
    </div>
  );
}
