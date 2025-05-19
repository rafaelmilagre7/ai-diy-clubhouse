
import React, { useState, useEffect, useCallback } from "react";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCw, AlertTriangle, Info } from "lucide-react";
import { TrailSolutionsList } from "./TrailSolutionsList";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ImplementationTrailCreator = () => {
  const { trail, isLoading, error, hasContent, generateImplementationTrail, refreshTrail, regenerating, refreshing } = useImplementationTrail();
  const { solutions: allSolutions, loading: solutionsLoading } = useSolutionsData();
  const [processedSolutions, setProcessedSolutions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [missingIds, setMissingIds] = useState<string[]>([]);
  
  // Processar soluções quando os dados estiverem disponíveis
  useEffect(() => {
    const processSolutions = () => {
      if (!trail || !allSolutions?.length) {
        setProcessedSolutions([]);
        return;
      }

      const result = [];
      const missingIdsList: string[] = [];
      
      // Função auxiliar para processar itens por prioridade
      const processItems = (items: any[] = [], priority: number) => {
        items.forEach((item: any) => {
          if (!item || !item.solutionId) return;
          
          const solution = allSolutions.find(s => s.id === item.solutionId);
          if (solution) {
            result.push({
              ...solution,
              ...item,
              priority
            });
          } else {
            // Registrar IDs de soluções ausentes
            missingIdsList.push(item.solutionId);
          }
        });
      };
      
      // Processar cada nível de prioridade
      processItems((trail as any).priority1 || [], 1);
      processItems((trail as any).priority2 || [], 2);
      processItems((trail as any).priority3 || [], 3);

      setProcessedSolutions(result);
      setMissingIds(missingIdsList);
      
      // Mostrar aviso se alguma solução não foi encontrada
      if (missingIdsList.length > 0) {
        console.warn("Algumas soluções na trilha não foram encontradas:", missingIdsList);
      }
    };

    processSolutions();
  }, [trail, allSolutions]);

  // Função para gerar a trilha
  const handleGenerateTrail = async () => {
    try {
      setIsGenerating(true);
      await generateImplementationTrail({});
      toast.success("Trilha de implementação gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar trilha:", error);
      toast.error("Não foi possível gerar sua trilha. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Função para atualizar a trilha
  const handleRefreshTrail = async () => {
    try {
      await refreshTrail(true);
      toast.success("Trilha atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar trilha:", error);
      toast.error("Erro ao atualizar trilha. Tente novamente.");
    }
  };

  // Estado de carregamento
  if (isLoading || solutionsLoading || regenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] py-8">
        <Loader2 className="h-8 w-8 text-[#0ABAB5] animate-spin mb-4" />
        <p className="text-neutral-300">
          {regenerating 
            ? "Gerando sua trilha personalizada..." 
            : refreshing 
              ? "Atualizando dados da trilha..." 
              : "Carregando sua trilha personalizada..."}
        </p>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-900/40 rounded-lg p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2 text-white">Erro ao carregar trilha</h3>
        <p className="text-neutral-300 mb-4">
          Não foi possível carregar sua trilha personalizada.
        </p>
        <Button onClick={handleGenerateTrail} disabled={isGenerating || regenerating}>
          {isGenerating || regenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            "Tentar Novamente"
          )}
        </Button>
      </div>
    );
  }

  // Se não há conteúdo na trilha, exibir opção para gerar
  if (!hasContent || processedSolutions.length === 0) {
    return (
      <div className="text-center py-8 space-y-6">
        <div className="bg-[#151823]/80 border border-[#0ABAB5]/20 rounded-lg p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-medium mb-4 text-white">Vamos criar sua trilha personalizada</h3>
          <p className="text-neutral-300 mb-6">
            Baseado nas suas respostas do onboarding, vamos gerar uma trilha 
            de implementação exclusiva para o seu negócio.
          </p>
          <Button 
            onClick={handleGenerateTrail} 
            disabled={isGenerating || regenerating}
            className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          >
            {isGenerating || regenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Trilha...
              </>
            ) : (
              "Gerar Minha Trilha"
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Exibir a trilha quando estiver disponível
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Suas soluções recomendadas</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshTrail}
          disabled={refreshing || regenerating}
          className="border-neutral-700 hover:border-[#0ABAB5] hover:bg-[#0ABAB5]/10"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </>
          )}
        </Button>
      </div>
      
      {missingIds.length > 0 && (
        <Alert variant="warning" className="bg-amber-900/20 border-amber-700/40 text-amber-300">
          <Info className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-300">
            Algumas soluções recomendadas não estão mais disponíveis. A trilha foi atualizada.
          </AlertDescription>
        </Alert>
      )}
      
      <Separator className="bg-neutral-800" />
      
      <TrailSolutionsList solutions={processedSolutions} />
    </div>
  );
};
