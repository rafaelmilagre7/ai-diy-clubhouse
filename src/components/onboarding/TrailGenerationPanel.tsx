import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { toast } from "sonner";
import { isTrailStuck, countTrailSolutions, sanitizeTrailData } from "@/hooks/implementation/useImplementationTrail.utils";

// Subcomponentes
import { TrailPanelHeader } from "./TrailGenerationPanel/TrailPanelHeader";
import { TrailPanelState } from "./TrailGenerationPanel/TrailPanelState";
import { TrailPanelSolutions } from "./TrailGenerationPanel/TrailPanelSolutions";
import { TrailPanelActions } from "./TrailGenerationPanel/TrailPanelActions";

export const TrailGenerationPanel = ({ onClose }: { onClose?: () => void }) => {
  const { trail, isLoading, generateImplementationTrail, refreshTrail, hasContent, clearTrail } = useImplementationTrail();
  const { solutions: allSolutions, loading: solutionsLoading } = useSolutionsData();
  const [regenerating, setRegenerating] = useState(false);
  const [showMagic, setShowMagic] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);
  const [loadingFailed, setLoadingFailed] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Iniciar carregamento com controle de tempo
  useEffect(() => {
    const loadFreshData = async () => {
      setRefreshing(true);
      setLoadStartTime(Date.now());
      setAttemptCount(prev => prev + 1);
      
      try {
        const trailData = await refreshTrail(true);
        
        if (!trailData || countTrailSolutions(trailData) === 0) {
          console.log("Nenhuma trilha encontrada ou sem soluções válidas");
          if (attemptCount >= 2) {
            setLoadingFailed(true);
          }
        } else {
          console.log("Trilha carregada com", countTrailSolutions(trailData), "soluções");
          setLoadingFailed(false);
        }
      } catch (error) {
        console.error("Erro ao recarregar trilha:", error);
        if (attemptCount >= 2) {
          setLoadingFailed(true);
        }
      } finally {
        setRefreshing(false);
        setLoadStartTime(null);
      }
    };
    
    loadFreshData();
    
    // Adicionar um timeout para evitar carregamento infinito
    const timeoutId = setTimeout(() => {
      if (refreshing && loadStartTime) {
        if (isTrailStuck(trail, loadStartTime)) {
          console.log("Carregamento da trilha excedeu o tempo limite");
          setRefreshing(false);
          setLoadingTimeout(true);
          toast.error("Tempo limite de carregamento excedido. Tente novamente.");
        }
      }
    }, 12000); // 12 segundos de timeout
    
    return () => clearTimeout(timeoutId);
  }, [refreshTrail, trail]);

  // Mapeamento de soluções com tratamento de erros aprimorado
  const solutions = useMemo(() => {
    if (!trail || !allSolutions || allSolutions.length === 0) return [];
    
    try {
      const sanitizedTrail = sanitizeTrailData(trail);
      if (!sanitizedTrail) return [];
      
      const result: any[] = [];
      ["priority1", "priority2", "priority3"].forEach((priorityLevel, idx) => {
        const items = Array.isArray((sanitizedTrail as any)[priorityLevel]) ? (sanitizedTrail as any)[priorityLevel] : [];
        
        items.forEach((item: any) => {
          if (!item || typeof item !== 'object') return;
          
          const solutionId = item.solutionId;
          if (!solutionId) return;
          
          const fullSolution = allSolutions.find(s => s.id === solutionId);
          if (fullSolution) {
            result.push({
              ...item,
              ...fullSolution,
              priority: idx + 1,
              title: fullSolution.title || "Solução sem título",
              description: fullSolution.description || item.description || "Sem descrição disponível.",
              justification: item.justification || "Recomendação personalizada",
              solutionId: solutionId
            });
          } else {
            // Incluir mesmo sem encontrar a solução completa
            result.push({
              ...item,
              priority: idx + 1,
              title: item.title || "Solução não encontrada",
              description: item.description || "Sem descrição disponível.",
              solutionId: solutionId
            });
          }
        });
      });
      
      return result;
    } catch (error) {
      console.error("Erro ao processar soluções da trilha:", error);
      return [];
    }
  }, [trail, allSolutions]);

  const handleRegenerate = useCallback(async () => {
    try {
      setRegenerating(true);
      setLoadingFailed(false);
      setLoadingTimeout(false);
      setLoadStartTime(Date.now());
      
      // Limpar a trilha anterior antes de gerar uma nova
      await clearTrail();
      
      // Gerar nova trilha
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
  }, [generateImplementationTrail, clearTrail]);

  const handleRefreshTrail = useCallback(async () => {
    setRefreshing(true);
    setLoadingFailed(false);
    setLoadingTimeout(false);
    setLoadStartTime(Date.now());
    setAttemptCount(prev => prev + 1);
    
    try {
      const data = await refreshTrail(true);
      if (data && countTrailSolutions(data) > 0) {
        toast.success("Trilha atualizada com sucesso!");
        setLoadingFailed(false);
      } else {
        console.log("Trilha recarregada, mas sem soluções válidas");
        if (attemptCount >= 2) {
          setLoadingFailed(true);
          toast.error("A trilha parece estar vazia ou corrompida. Tente gerar uma nova.");
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar trilha:", error);
      toast.error("Erro ao atualizar trilha");
      setLoadingFailed(true);
    } finally {
      setRefreshing(false);
      setLoadStartTime(null);
    }
  }, [refreshTrail, attemptCount]);

  // Timeout para detectar operações que demoram demais
  useEffect(() => {
    if (!loadStartTime) return;
    
    const timeoutId = setTimeout(() => {
      if (loadStartTime && (refreshing || regenerating)) {
        console.warn("Operação excedeu o tempo limite");
        setLoadingTimeout(true);
        setRegenerating(false);
        setRefreshing(false);
        setLoadStartTime(null);
      }
    }, 30000); // 30 segundos
    
    return () => clearTimeout(timeoutId);
  }, [loadStartTime, refreshing, regenerating]);

  const isPanelLoading = isLoading || regenerating || solutionsLoading || refreshing;
  const hasValidTrail = trail && solutions.length > 0;
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
      <div className="w-full space-y-4">
        <div className="flex justify-center items-center h-40">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-t-[#0ABAB5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-[#0ABAB5] font-medium">
              {regenerating 
                ? "Gerando nova trilha..." 
                : refreshing 
                  ? "Atualizando trilha personalizada..." 
                  : "Carregando trilha personalizada..."}
            </p>
            {attemptCount > 2 && (
              <button 
                onClick={handleRefreshTrail}
                className="mt-4 text-sm text-gray-500 hover:text-[#0ABAB5] underline"
              >
                Este processo está demorando. Clique para tentar novamente.
              </button>
            )}
          </div>
        </div>
      </div>
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
