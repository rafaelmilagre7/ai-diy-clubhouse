
import React, { useState, useEffect, useCallback } from "react";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCw, AlertTriangle, HelpCircle, Info } from "lucide-react";
import { TrailSolutionsList } from "./TrailSolutionsList";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleHelp } from "lucide-react";

export const ImplementationTrailCreator = () => {
  const navigate = useNavigate();
  const { 
    trail, 
    isLoading, 
    error, 
    detailedError, 
    hasContent, 
    generateImplementationTrail, 
    refreshTrail,
    generateWithRetries
  } = useImplementationTrail();
  
  const { solutions: allSolutions, loading: solutionsLoading } = useSolutionsData();
  const [processedSolutions, setProcessedSolutions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  
  // Processar soluções quando os dados estiverem disponíveis
  useEffect(() => {
    if (solutionsLoading || !allSolutions?.length) return;
    
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
          } else {
            console.warn(`Solução não encontrada para ID: ${item.solutionId}`);
          }
        });
      });

      setProcessedSolutions(result);
    };

    processSolutions();
  }, [trail, allSolutions, solutionsLoading]);

  // Função para gerar a trilha com retentativas
  const handleGenerateTrail = async () => {
    try {
      setIsGenerating(true);
      setAttemptCount(prev => prev + 1);
      
      // Usar generateWithRetries para até 3 tentativas automáticas com delays
      await generateWithRetries({}, 3);
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

  // Exibir detalhes técnicos do erro para debug
  const ErrorDebugInfo = () => {
    if (!detailedError) return null;
    
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-xs overflow-auto max-h-[200px]">
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold">Detalhes técnicos (para suporte):</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs h-6 px-2"
          >
            {showDebug ? "Ocultar" : "Mostrar"}
          </Button>
        </div>
        {showDebug && (
          <pre>{JSON.stringify(detailedError, null, 2)}</pre>
        )}
      </div>
    );
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
      <div className="space-y-6">
        <Alert variant="destructive" className="bg-red-50 border border-red-200">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="ml-2 text-red-800">Erro ao carregar trilha</AlertTitle>
          <AlertDescription className="ml-2 text-red-700">
            Não foi possível carregar sua trilha personalizada. 
            Isto geralmente acontece quando seu perfil de implementação não está 
            completo ou há um problema de conexão.
          </AlertDescription>
        </Alert>
        
        <Card className="border border-red-100">
          <CardContent className="pt-6">
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
            
            {attemptCount > 1 && (
              <Alert className="mt-6 bg-amber-50 border-amber-200">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700 text-sm">
                  Múltiplas tentativas detectadas. Verifique se:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Seu perfil de implementação está completo</li>
                    <li>O campo "is_completed" está marcado como true</li>
                    <li>Você possui informações preenchidas sobre seus objetivos de negócio</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            <ErrorDebugInfo />
          </CardContent>
        </Card>
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
            Baseado nas suas respostas do perfil de implementação, vamos gerar uma trilha 
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
          className="text-[#0ABAB5]"
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
      
      {processedSolutions.length > 0 ? (
        <TrailSolutionsList solutions={processedSolutions} />
      ) : (
        <div className="text-center py-8">
          <CircleHelp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhuma solução encontrada</h3>
          <p className="text-gray-500 mb-4">
            Não encontramos soluções correspondentes ao seu perfil. Tente atualizar seu perfil com mais informações.
          </p>
          <Button
            onClick={handleGenerateTrail}
            className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          >
            Tentar Novamente
          </Button>
        </div>
      )}
    </div>
  );
};
