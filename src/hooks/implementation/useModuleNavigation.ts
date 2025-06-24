
import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLogging } from "@/hooks/useLogging";

export const useModuleNavigation = () => {
  const { id, moduleIdx } = useParams<{ id: string; moduleIdx: string }>();
  const navigate = useNavigate();
  const { log } = useLogging();
  
  const currentIndex = parseInt(moduleIdx || "0");
  const [interactionStates, setInteractionStates] = useState<Record<number, boolean>>({});

  const navigateToModule = useCallback((moduleIndex: number) => {
    log('Navegando para módulo', { solutionId: id, moduleIndex });
    navigate(`/implement/${id}/${moduleIndex}`);
  }, [id, navigate, log]);

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    log('Avançando para próximo módulo', { currentIndex, nextIndex });
    navigateToModule(nextIndex);
  }, [currentIndex, navigateToModule, log]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      log('Voltando para módulo anterior', { currentIndex, prevIndex });
      navigateToModule(prevIndex);
    } else {
      log('Voltando para página da solução', { solutionId: id });
      navigate(`/solution/${id}`);
    }
  }, [currentIndex, id, navigate, navigateToModule, log]);

  const markInteraction = useCallback((moduleIndex: number) => {
    setInteractionStates(prev => ({
      ...prev,
      [moduleIndex]: true
    }));
  }, []);

  const hasInteracted = useCallback((moduleIndex: number) => {
    return interactionStates[moduleIndex] || false;
  }, [interactionStates]);

  return {
    currentIndex,
    navigateToModule,
    handleNext,
    handlePrevious,
    markInteraction,
    hasInteracted
  };
};
