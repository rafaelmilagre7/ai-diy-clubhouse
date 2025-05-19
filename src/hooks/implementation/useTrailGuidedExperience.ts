
import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useImplementationTrail } from "./useImplementationTrail";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { toast } from "sonner";
import { sanitizeTrailData } from "./useImplementationTrail.utils";

export const useTrailGuidedExperience = () => {
  const navigate = useNavigate();
  const { trail, isLoading, hasContent, refreshTrail, generateImplementationTrail } = useImplementationTrail();
  const { solutions: allSolutions, loading: solutionsLoading } = useSolutionsData();
  const [started, setStarted] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [typingFinished, setTypingFinished] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showMagicExperience, setShowMagicExperience] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Montar lista de soluções ordenadas para a navegação
  const solutionsList = useMemo(() => {
    if (!trail || !allSolutions || allSolutions.length === 0) return [];
    
    try {
      const sanitizedTrail = sanitizeTrailData(trail);
      if (!sanitizedTrail) return [];
      
      const all: any[] = [];

      ["priority1", "priority2", "priority3"].forEach((priorityKey, idx) => {
        const items = Array.isArray((sanitizedTrail as any)[priorityKey]) ? (sanitizedTrail as any)[priorityKey] : [];
        
        items.forEach((item: any) => {
          if (!item || !item.solutionId) return;
          
          // Procura a solução completa pelo ID
          const fullSolution = allSolutions.find(s => s.id === item.solutionId);

          if (fullSolution) {
            all.push({
              ...item,
              ...fullSolution,
              priority: idx + 1,
              title: fullSolution.title || "Solução sem título",
              justification: item.justification || "Recomendação personalizada para seu negócio",
              solutionId: item.solutionId
            });
          }
        });
      });

      return all;
    } catch (error) {
      console.error("Erro ao processar lista de soluções:", error);
      return [];
    }
  }, [trail, allSolutions]);

  // Solução do step atual
  const currentSolution = useMemo(() => {
    if (!solutionsList.length || currentStepIdx >= solutionsList.length) return null;
    return solutionsList[currentStepIdx];
  }, [solutionsList, currentStepIdx]);

  // Function para tentar recarregar dados da trilha
  const refreshTrailData = useCallback(async () => {
    setLoadingError(false);
    setRefreshing(true);
    
    try {
      await refreshTrail(true);
      toast.success("Dados da trilha atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar dados da trilha:", error);
      setLoadingError(true);
      toast.error("Não foi possível atualizar os dados da trilha");
    } finally {
      setRefreshing(false);
    }
  }, [refreshTrail]);

  // Handler para iniciar a geração da trilha
  const handleStartGeneration = useCallback(async (shouldRegenerate = true) => {
    // Se não devemos regenerar, apenas iniciar a visualização
    if (!shouldRegenerate) {
      setStarted(true);
      return;
    }
    
    setShowMagicExperience(true);
    setRegenerating(true);
    setLoadingError(false);

    try {
      if (shouldRegenerate) {
        // Chamamos sem parâmetros ou com null
        await generateImplementationTrail(null);
        toast.success("Trilha personalizada gerada com sucesso!");
      }
      
      setStarted(true);
      setCurrentStepIdx(0);
      setTypingFinished(false);
    } catch (error) {
      console.error("Erro ao gerar a trilha:", error);
      toast.error("Erro ao gerar a trilha personalizada.");
      setLoadingError(true);
    } finally {
      setRegenerating(false);
    }
  }, [generateImplementationTrail]);

  const handleMagicFinish = useCallback(() => {
    setShowMagicExperience(false);
    setStarted(true);
  }, []);

  const handleNext = useCallback(() => {
    if (!typingFinished) return;
    if (currentStepIdx < solutionsList.length - 1) {
      setCurrentStepIdx(v => v + 1);
      setTypingFinished(false);
    }
  }, [typingFinished, currentStepIdx, solutionsList.length]);

  const handlePrevious = useCallback(() => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(v => v - 1);
      setTypingFinished(false);
    }
  }, [currentStepIdx]);

  const handleSelectSolution = useCallback((id: string) => {
    navigate(`/solution/${id}`);
  }, [navigate]);

  const handleTypingComplete = useCallback(() => {
    setTypingFinished(true);
  }, []);

  return {
    isLoading,
    regenerating,
    solutionsLoading,
    refreshing,
    started,
    showMagicExperience,
    currentStepIdx,
    typingFinished,
    solutionsList,
    currentSolution,
    loadingError,
    hasContent,
    handleStartGeneration,
    handleMagicFinish,
    handleNext,
    handlePrevious,
    handleSelectSolution,
    handleTypingComplete,
    refreshTrailData
  };
};
