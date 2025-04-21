
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { toast } from "sonner";
import { TrailMagicExperience } from "./TrailMagicExperience";

// Subcomponentes
import { TrailPanelHeader } from "./TrailGenerationPanel/TrailPanelHeader";
import { TrailPanelState } from "./TrailGenerationPanel/TrailPanelState";
import { TrailPanelSolutions } from "./TrailGenerationPanel/TrailPanelSolutions";
import { TrailPanelActions } from "./TrailGenerationPanel/TrailPanelActions";

export const TrailGenerationPanel = ({ onClose }: { onClose?: () => void }) => {
  const { trail, isLoading, generateImplementationTrail, refreshTrail, hasContent } = useImplementationTrail();
  const { solutions: allSolutions, loading: solutionsLoading } = useSolutionsData();
  const [regenerating, setRegenerating] = useState(false);
  const [showMagic, setShowMagic] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const solutions = useMemo(() => {
    if (!trail || !allSolutions || allSolutions.length === 0) return [];
    const result: any[] = [];
    ["priority1", "priority2", "priority3"].forEach((priorityLevel, idx) => {
      const items = (trail as any)[priorityLevel] || [];
      items.forEach((item: any) => {
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
    return result;
  }, [trail, allSolutions]);

  const handleRegenerate = useCallback(async () => {
    try {
      setShowMagic(true);
      setRegenerating(true);
      await generateImplementationTrail();
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

  const isPanelLoading = isLoading || regenerating || solutionsLoading || refreshing;
  const hasValidTrail = trail && solutions.length > 0;

  if (showMagic) {
    return <TrailMagicExperience onFinish={handleFinishMagic} />;
  }

  if (!hasValidTrail) {
    return (
      <TrailPanelState
        isLoading={isLoading}
        regenerating={regenerating}
        solutionsLoading={solutionsLoading}
        refreshing={refreshing}
        showMagic={showMagic}
        onRegenerate={handleRegenerate}
        onRefresh={handleRefreshTrail}
      />
    );
  }

  return (
    <div>
      <div className="w-full bg-gradient-to-br from-[#0ABAB5]/5 to-white border-[#0ABAB5]/15 rounded-2xl shadow p-8 mb-4 animate-fade-in">
        <TrailPanelHeader />
        <TrailPanelSolutions solutions={solutions} />
        <TrailPanelActions onRegenerate={handleRegenerate} onClose={onClose} />
      </div>
    </div>
  );
};
