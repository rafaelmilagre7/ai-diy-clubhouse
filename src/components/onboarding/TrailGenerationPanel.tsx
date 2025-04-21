
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { TrailCardList } from "@/components/dashboard/TrailCardList";
import { Button } from "@/components/ui/button";
import { Edit, Loader2, RefreshCcw, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TrailMagicExperience } from "./TrailMagicExperience";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { toast } from "sonner";

export const TrailGenerationPanel = ({ onClose }: { onClose?: () => void }) => {
  const { trail, isLoading, generateImplementationTrail, refreshTrail, hasContent } = useImplementationTrail();
  const { solutions: allSolutions, loading: solutionsLoading } = useSolutionsData();
  const [regenerating, setRegenerating] = useState(false);
  const [showMagic, setShowMagic] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Forçar um refresh dos dados da trilha ao montar o componente
  useEffect(() => {
    const loadFreshData = async () => {
      setRefreshing(true);
      try {
        await refreshTrail(true);
      } catch (error) {
        console.error("Erro ao recarregar trilha:", error);
      } finally {
        setRefreshing(false);
      }
    };

    loadFreshData();
  }, [refreshTrail]);

  // Montar soluções da trilha com dados completos
  const solutions = useMemo(() => {
    if (!trail || !allSolutions || allSolutions.length === 0) return [];
    
    const result: any[] = [];
    
    ["priority1", "priority2", "priority3"].forEach((priorityLevel, idx) => {
      const items = (trail as any)[priorityLevel] || [];
      
      items.forEach((item: any) => {
        // Encontra a solução completa pelo ID
        const fullSolution = allSolutions.find(s => s.id === item.solutionId);
        
        if (fullSolution) {
          result.push({
            ...item,
            ...fullSolution,
            priority: idx + 1,
            title: fullSolution.title || "Solução sem título",
            description: fullSolution.description || item.description || "Sem descrição disponível.",
            justification: item.justification || "Recomendação personalizada",
            solutionId: item.solutionId || fullSolution.id
          });
        } else {
          console.warn(`Solução com ID ${item.solutionId} não encontrada no banco`);
          // Fallback para garantir que pelo menos algo aparece
          result.push({
            ...item,
            priority: idx + 1,
            title: item.title || "Solução não encontrada",
            description: item.description || "Sem descrição disponível.",
            solutionId: item.solutionId || item.id || "sem-id"
          });
        }
      });
    });
    
    console.log("Lista de soluções montada em TrailGenerationPanel:", result.length, "soluções");
    return result;
  }, [trail, allSolutions]);

  // Nova função de geração que exibe a experiência mágica
  const handleRegenerate = useCallback(async () => {
    try {
      setShowMagic(true);
      setRegenerating(true);
      await generateImplementationTrail(); // Já busca soluções mais atuais automaticamente!
    } catch (error) {
      console.error("Erro ao gerar trilha:", error);
      toast.error("Não foi possível gerar sua trilha. Tente novamente.");
    } finally {
      setRegenerating(false);
    }
  }, [generateImplementationTrail]);

  const handleFinishMagic = useCallback(() => {
    setShowMagic(false);
  }, []);

  // Função para recarregar a trilha do banco de dados
  const handleRefreshTrail = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshTrail(true);
      toast.success("Trilha atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar trilha:", error);
      toast.error("Erro ao atualizar trilha");
    } finally {
      setRefreshing(false);
    }
  }, [refreshTrail]);

  if (showMagic) {
    return <TrailMagicExperience onFinish={handleFinishMagic} />;
  }

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

  // Verificação adicional para garantir que temos dados
  const hasValidTrail = trail && solutions.length > 0;

  if (!hasValidTrail) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <div className="text-center space-y-2">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
          <span className="text-gray-600 block">Nenhuma trilha personalizada foi encontrada ou a trilha está vazia.</span>
          <p className="text-sm text-gray-500">Isso pode acontecer se a trilha foi apagada ou se houve um problema no banco de dados.</p>
        </div>
        <Button
          onClick={handleRegenerate}
          className="bg-[#0ABAB5] text-white"
        >
          Gerar Nova Trilha Personalizada
        </Button>
        <Button
          variant="outline"
          onClick={handleRefreshTrail}
          className="flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Tentar Carregar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Painel GRANDE com orientação IA e a trilha exibida */}
      <div className="w-full bg-gradient-to-br from-[#0ABAB5]/5 to-white border-[#0ABAB5]/15 rounded-2xl shadow p-8 mb-4 animate-fade-in">
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-[#0ABAB5] mb-2 text-center">
            Pronto! Sua jornada está aqui ✨
          </h2>
          <div className="text-lg text-gray-700 max-w-2xl mx-auto text-center">
            <span className="font-semibold">Recomendação IA Milagrinho:</span> <br />
            <span>
              Com base em tudo que você compartilhou, estas são as{" "}
              <span className="text-[#0ABAB5] font-bold">soluções mais alinhadas</span> ao momento da sua empresa.
              <br />
              <span className="font-medium">
                * Escolha a que faz mais sentido, aprofunde na justificativa indicada e clique para começar a implementar, focando no resultado! *
              </span>
            </span>
          </div>
        </div>

        <TrailCardList
          solutions={solutions}
          onSolutionClick={(id) => navigate(`/solution/${id}`)}
          onSeeAll={() => navigate("/solutions")}
        />
        <div className="flex flex-wrap justify-between mt-6 gap-2">
          <Button 
            variant="ghost" 
            onClick={handleRegenerate}
            className="flex items-center gap-1"
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            Regenerar Trilha
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate("/onboarding/review")}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4 mr-1" /> 
              Editar Onboarding
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
