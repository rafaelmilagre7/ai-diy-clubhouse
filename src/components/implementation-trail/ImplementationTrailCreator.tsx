
import React, { useState, useEffect, useCallback } from "react";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { TrailSolutionsList } from "./TrailSolutionsList";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const ImplementationTrailCreator = () => {
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
      
      // Para cada nível de prioridade, processar as soluções
      ["priority1", "priority2", "priority3"].forEach((priority, idx) => {
        const items = (trail as any)[priority] || [];
        items.forEach((item: any) => {
          const solution = allSolutions.find(s => s.id === item.solutionId);
          if (solution) {
            result.push({
              ...solution,
              ...item,
              priority: idx + 1,
              justification: item.justification || "Recomendação baseada no seu perfil" // Garantir justificativa
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
      
      // Exibir toast informativo
      toast.info("Gerando sua trilha personalizada...", {
        duration: 2000,
      });
      
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
      
      // Exibir toast informativo
      toast.info("Atualizando sua trilha personalizada...", {
        duration: 2000,
      });
      
      await refreshTrail(true);
      toast.success("Trilha atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar trilha:", error);
      toast.error("Erro ao atualizar trilha. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Mostrar conteúdo cacheado imediatamente enquanto carrega no background
  // Isso elimina o flicker e sensação de "pesado"
  
  // Estado de erro
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
      >
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Erro ao carregar trilha</h3>
        <p className="text-gray-600 mb-4">
          Não foi possível carregar sua trilha personalizada.
        </p>
        <Button onClick={handleGenerateTrail} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            "Tentar Novamente"
          )}
        </Button>
      </motion.div>
    );
  }

  // Se não há conteúdo na trilha, exibir opção para gerar
  // Mesmo durante carregamento mostrar o UI básico
  if (!hasContent || processedSolutions.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="text-center py-8 space-y-6"
      >
        <div className="bg-blue-50 rounded-lg p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-medium mb-4">Vamos criar sua trilha personalizada</h3>
          <p className="text-gray-600 mb-6">
            Baseado nas suas respostas do onboarding, vamos gerar uma trilha 
            de implementação exclusiva para o seu negócio.
          </p>
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
        </div>
      </motion.div>
    );
  }

  // Mostrar loader individual apenas para os itens sendo carregados
  // Remover loading global da página inteira
  const isItemLoading = isLoading || solutionsLoading;

  // Exibir a trilha quando estiver disponível
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
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
      
      {/* Mostrar soluções sempre, mesmo durante carregamento */}
      <TrailSolutionsList solutions={processedSolutions} isItemLoading={isItemLoading} />
    </motion.div>
  );
};
