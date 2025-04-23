
import React, { useState, useEffect, useCallback } from "react";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCw, AlertTriangle, HelpCircle } from "lucide-react";
import { TrailSolutionsList } from "./TrailSolutionsList";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const ImplementationTrailCreator = () => {
  const navigate = useNavigate();
  const { trail, isLoading, error, hasContent, generateImplementationTrail, refreshTrail } = useImplementationTrail();
  const { solutions: allSolutions, loading: solutionsLoading } = useSolutionsData();
  const [processedSolutions, setProcessedSolutions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Processar soluções quando os dados estiverem disponíveis
  useEffect(() => {
    const processSolutions = () => {
      if (!trail || !allSolutions?.length) {
        setProcessedSolutions([]);
        return;
      }

      const result = [];
      
      ["priority1", "priority2", "priority3"].forEach((priority, idx) => {
        const items = (trail as any)[priority] || [];
        items.forEach((item: any) => {
          const solution = allSolutions.find(s => s.id === item.solutionId);
          if (solution) {
            result.push({
              ...solution,
              ...item,
              priority: idx + 1
            });
          }
        });
      });

      setProcessedSolutions(result);
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
      setIsGenerating(true);
      await refreshTrail(true);
      toast.success("Trilha atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar trilha:", error);
      toast.error("Erro ao atualizar trilha. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Função para navegar para a página de perfil de implementação
  const handleNavigateToProfile = () => {
    navigate("/perfil-de-implementacao");
  };

  // Estado de carregamento
  if (isLoading || solutionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] py-8">
        <Loader2 className="h-8 w-8 text-[#0ABAB5] animate-spin mb-4" />
        <p className="text-muted-foreground">Carregando sua trilha personalizada...</p>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Erro ao carregar trilha</h3>
          <p className="text-gray-600 mb-4 max-w-lg">
            Não foi possível carregar sua trilha personalizada. 
            Isto geralmente acontece quando seu perfil de implementação não está 
            completo ou há um problema de conexão.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={handleGenerateTrail} 
            disabled={isGenerating}
            className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              "Tentar Novamente"
            )}
          </Button>
          
          <Button 
            onClick={handleNavigateToProfile} 
            variant="outline"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Verificar Perfil
          </Button>
        </div>
      </div>
    );
  }

  // Se não há conteúdo na trilha, exibir opção para gerar
  if (!hasContent || processedSolutions.length === 0) {
    return (
      <div className="text-center py-8 space-y-6">
        <div className="bg-blue-50 rounded-lg p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-medium mb-4">Vamos criar sua trilha personalizada</h3>
          <p className="text-gray-600 mb-6">
            Baseado nas suas respostas do onboarding, vamos gerar uma trilha 
            de implementação exclusiva para o seu negócio.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button 
              onClick={handleGenerateTrail} 
              disabled={isGenerating}
              className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Trilha...
                </>
              ) : (
                "Gerar Minha Trilha"
              )}
            </Button>
            <Button 
              onClick={handleNavigateToProfile} 
              variant="outline"
            >
              Verificar Perfil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Exibir a trilha quando estiver disponível
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Suas soluções recomendadas</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshTrail}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </>
          )}
        </Button>
      </div>
      
      <Separator />
      
      <TrailSolutionsList solutions={processedSolutions} />
    </div>
  );
};
