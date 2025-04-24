
import React from "react";
import { Loader2, AlertTriangle, RefreshCcw, AlertCircle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function TrailPanelState({
  isLoading,
  regenerating,
  solutionsLoading,
  refreshing,
  showMagic,
  loadingFailed = false,
  loadingTimeout = false,
  onRegenerate,
  onRefresh,
  attemptCount = 0
}: {
  isLoading: boolean;
  regenerating: boolean;
  solutionsLoading: boolean;
  refreshing: boolean;
  showMagic: boolean;
  loadingFailed?: boolean;
  loadingTimeout?: boolean;
  onRegenerate: () => void;
  onRefresh: () => void;
  attemptCount?: number;
}) {
  if (showMagic) return null;

  if (isLoading || regenerating || solutionsLoading || refreshing) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="h-8 w-8 text-[#0ABAB5] animate-spin" />
        <span className="text-[#0ABAB5] font-medium">
          {regenerating 
            ? "Milagrinho está preparando sua trilha personalizada..." 
            : refreshing 
              ? "Recarregando trilha existente..." 
              : "Carregando dados da trilha..."}
        </span>
        {attemptCount > 2 && (
          <p className="text-sm text-gray-500 max-w-md text-center mt-2">
            Este processo está demorando mais que o esperado. 
            Você pode tentar gerar novamente usando o botão abaixo.
          </p>
        )}
        {attemptCount > 2 && (
          <Button
            variant="outline"
            onClick={onRefresh}
            className="mt-2"
            size="sm"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Forçar recarregamento
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="flex flex-col items-center gap-6 py-8 px-6 border-amber-200 bg-amber-50">
      <div className="text-center space-y-2 max-w-lg">
        {loadingFailed || loadingTimeout ? (
          <>
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
            <span className="text-gray-700 block font-medium">
              {loadingTimeout 
                ? "O carregamento da trilha excedeu o tempo limite" 
                : "Erro ao carregar a trilha personalizada"}
            </span>
            <p className="text-sm text-gray-600">
              {loadingTimeout
                ? "Sua trilha pode estar demorando muito para carregar ou encontramos algum problema técnico."
                : "Ocorreu um problema ao tentar carregar ou gerar sua trilha. Tente novamente ou entre em contato com o suporte."}
            </p>
          </>
        ) : (
          <>
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
            <span className="text-gray-700 block font-medium">Nenhuma trilha personalizada encontrada</span>
            <p className="text-sm text-gray-600">
              Parece que você ainda não tem uma trilha personalizada ou a trilha está vazia.
              Vamos criar uma agora para você começar a implementar soluções de IA em seu negócio!
            </p>
          </>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onRegenerate}
          className="bg-[#0ABAB5] text-white hover:bg-[#09a19c]"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          {loadingFailed || loadingTimeout ? "Tentar Gerar Nova Trilha" : "Gerar Trilha Personalizada"}
        </Button>
        {(loadingFailed || loadingTimeout) && (
          <Button
            variant="outline"
            onClick={onRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Tentar Recarregar
          </Button>
        )}
      </div>
    </Card>
  );
}
