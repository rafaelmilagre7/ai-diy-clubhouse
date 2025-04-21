
import React, { useState, useMemo, useEffect } from "react";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { toast } from "sonner";
import { isTrailStuck, countTrailSolutions, sanitizeTrailData } from "@/hooks/implementation/useImplementationTrail.utils";

import { TrailPanelState } from "./TrailGenerationPanel/TrailPanelState";
import { TrailLoadingPanel } from "./TrailGeneration/TrailLoadingPanel";
import { TrailContentPanel } from "./TrailGeneration/TrailContentPanel";

interface TrailGenerationPanelProps {
  onClose?: () => void;
  solutions?: any[];
  loading?: boolean;
  onLoadMore?: () => void;
  progress?: any;
}

export const TrailGenerationPanel: React.FC<TrailGenerationPanelProps> = ({ 
  onClose, 
  solutions: initialSolutions, 
  loading: externalLoading,
  onLoadMore,
  progress 
}) => {
  const { trail, isLoading, generateImplementationTrail, refreshTrail, hasContent, clearTrail } = useImplementationTrail();
  const { solutions: allSolutions, loading: solutionsLoading } = useSolutionsData();
  const [regenerating, setRegenerating] = useState(false);
  const [showMagic, setShowMagic] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);
  const [loadingFailed, setLoadingFailed] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Usar soluções fornecidas ou carregar do trail
  const [solutions, setSolutions] = useState<any[]>(initialSolutions || []);

  // Efeito para controle de carregamento inicial
  useEffect(() => {
    if (initialSolutions && initialSolutions.length > 0) {
      setSolutions(initialSolutions);
      return;
    }

    const loadFreshData = async () => {
      setRefreshing(true);
      setLoadStartTime(Date.now());
      setAttemptCount(prev => prev + 1);
      
      try {
        const trailData = await refreshTrail(true);
        if (!trailData || countTrailSolutions(trailData) === 0) {
          setLoadingFailed(attemptCount >= 2);
        } else {
          setLoadingFailed(false);
        }
      } catch (error) {
        console.error("Erro ao recarregar trilha:", error);
        setLoadingFailed(attemptCount >= 2);
      } finally {
        setRefreshing(false);
        setLoadStartTime(null);
      }
    };
    
    loadFreshData();
    
    const timeoutId = setTimeout(() => {
      if (refreshing && loadStartTime) {
        if (isTrailStuck(trail, loadStartTime)) {
          setRefreshing(false);
          setLoadingTimeout(true);
          toast.error("Tempo limite de carregamento excedido. Tente novamente.");
        }
      }
    }, 12000);
    
    return () => clearTimeout(timeoutId);
  }, [refreshTrail, trail, attemptCount, initialSolutions]);

  // Mapeamento de soluções
  useEffect(() => {
    if (!initialSolutions && trail && allSolutions?.length) {
      try {
        const sanitizedTrail = sanitizeTrailData(trail);
        if (!sanitizedTrail) return;
        
        const result: any[] = [];
        ["priority1", "priority2", "priority3"].forEach((priorityLevel, idx) => {
          const items = Array.isArray((sanitizedTrail as any)[priorityLevel]) 
            ? (sanitizedTrail as any)[priorityLevel] 
            : [];
          
          items.forEach((item: any) => {
            if (!item?.solutionId) return;
            
            const fullSolution = allSolutions.find(s => s.id === item.solutionId);
            if (fullSolution) {
              result.push({
                ...item,
                ...fullSolution,
                priority: idx + 1,
                title: fullSolution.title || "Solução sem título",
                description: fullSolution.description || item.description || "Sem descrição disponível.",
                justification: item.justification || "Recomendação personalizada",
                solutionId: item.solutionId
              });
            }
          });
        });
        
        setSolutions(result);
      } catch (error) {
        console.error("Erro ao processar soluções da trilha:", error);
      }
    }
  }, [trail, allSolutions, initialSolutions]);

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      setLoadingFailed(false);
      setLoadingTimeout(false);
      setLoadStartTime(Date.now());
      
      await clearTrail();
      await generateImplementationTrail();
      toast.success("Trilha regenerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar trilha:", error);
      toast.error("Não foi possível gerar sua trilha. Tente novamente.");
      setLoadingFailed(true);
    } finally {
      setRegenerating(false);
      setLoadStartTime(null);
    }
  };

  const handleRefreshTrail = () => {
    setRefreshing(true);
    setAttemptCount(prev => prev + 1);
    refreshTrail(true);
  };

  const isPanelLoading = externalLoading || isLoading || regenerating || solutionsLoading || refreshing;
  const hasValidTrail = (trail && solutions.length > 0) || (initialSolutions && initialSolutions.length > 0);
  const showEmptyState = (!hasValidTrail && !isPanelLoading) || loadingFailed || loadingTimeout;

  if (showEmptyState) {
    return (
      <TrailPanelState
        isLoading={isLoading}
        regenerating={regenerating}
        solutionsLoading={solutionsLoading}
        refreshing={refreshing}
        showMagic={showMagic}
        loadingFailed={loadingFailed}
        loadingTimeout={loadingTimeout}
        onRegenerate={handleRegenerate}
        onRefresh={handleRefreshTrail}
        attemptCount={attemptCount}
      />
    );
  }

  if (isPanelLoading) {
    return (
      <TrailLoadingPanel
        regenerating={regenerating}
        refreshing={refreshing}
        attemptCount={attemptCount}
        onRefreshTrail={handleRefreshTrail}
      />
    );
  }

  return (
    <TrailContentPanel
      solutions={solutions}
      generatingTrail={regenerating}
      onBackToOnboarding={onClose || (() => {})}
      onStartTrailGeneration={handleRegenerate}
    />
  );
};
