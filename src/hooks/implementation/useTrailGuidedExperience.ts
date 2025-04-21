
import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useImplementationTrail } from "./useImplementationTrail";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { toast } from "sonner";

export const useTrailGuidedExperience = () => {
  const navigate = useNavigate();
  const { trail, isLoading, generateImplementationTrail } = useImplementationTrail();
  const { solutions: allSolutions, loading: solutionsLoading } = useSolutionsData();
  const [started, setStarted] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [typingFinished, setTypingFinished] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showMagicExperience, setShowMagicExperience] = useState(false);

  // Montar lista de soluções ordenadas para a navegação
  const solutionsList = useMemo(() => {
    if (!trail || !allSolutions || allSolutions.length === 0) return [];
    const all: any[] = [];

    ["priority1", "priority2", "priority3"].forEach((priorityKey, idx) => {
      const items = (trail as any)[priorityKey] || [];
      items.forEach(item => {
        // Procura a solução completa pelo ID
        const fullSolution = allSolutions.find(s => s.id === item.solutionId);

        if (fullSolution) {
          all.push({
            ...item,
            ...fullSolution,
            priority: idx + 1,
            title: fullSolution.title || "Solução sem título",
            justification: item.justification || "Recomendação personalizada para seu negócio",
            solutionId: item.solutionId || fullSolution.id
          });
        } else {
          console.warn(`Solução com ID ${item.solutionId} não encontrada no banco de dados`);
          all.push({
            ...item,
            priority: idx + 1,
            title: item.title || "Solução não encontrada",
            justification: item.justification || "Recomendação personalizada para seu negócio",
            solutionId: item.solutionId || item.id || "sem-id"
          });
        }
      });
    });

    all.sort((a, b) => a.priority - b.priority);
    return all;
  }, [trail, allSolutions]);

  // Solução do step atual
  const currentSolution = useMemo(() => 
    solutionsList[currentStepIdx], 
    [solutionsList, currentStepIdx]
  );

  // Handler para iniciar a geração da trilha
  const handleStartGeneration = useCallback(async () => {
    setShowMagicExperience(true);
    setRegenerating(true);

    try {
      await generateImplementationTrail();
      toast.success("Trilha personalizada gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar a trilha:", error);
      toast.error("Erro ao gerar a trilha personalizada.");
    }
  }, [generateImplementationTrail]);

  const handleMagicFinish = useCallback(() => {
    setShowMagicExperience(false);
    setStarted(true);
    setCurrentStepIdx(0);
    setTypingFinished(false);
    setRegenerating(false);
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
    started,
    showMagicExperience,
    currentStepIdx,
    typingFinished,
    solutionsList,
    currentSolution,
    handleStartGeneration,
    handleMagicFinish,
    handleNext,
    handlePrevious,
    handleSelectSolution,
    handleTypingComplete
  };
};
