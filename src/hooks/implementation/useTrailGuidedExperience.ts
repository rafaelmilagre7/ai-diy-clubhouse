
import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useImplementationTrail } from "./useImplementationTrail";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { toast } from "sonner";
import { countTrailSolutions, sanitizeTrailData } from "./useImplementationTrail.utils";

export const useTrailGuidedExperience = () => {
  const navigate = useNavigate();
  const { trail, isLoading, generateImplementationTrail, refreshTrail, hasContent } = useImplementationTrail();
  const { solutions: allSolutions, loading: solutionsLoading } = useSolutionsData();
  const [started, setStarted] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [typingFinished, setTypingFinished] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showMagicExperience, setShowMagicExperience] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [loadingError, setLoadingError] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Montar lista de soluções ordenadas para a navegação com validação aprimorada
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
          } else {
            console.warn(`Solução com ID ${item.solutionId} não encontrada no banco de dados`);
            all.push({
              ...item,
              priority: idx + 1,
              title: item.title || "Solução não encontrada",
              justification: item.justification || "Recomendação personalizada para seu negócio",
              solutionId: item.solutionId
            });
          }
        });
      });

      // Ordenação explícita
      all.sort((a, b) => {
        // Primeiro por prioridade
        if (a.priority !== b.priority) return a.priority - b.priority;
        // Depois por título
        return (a.title || "").localeCompare(b.title || "");
      });
      
      return all;
    } catch (error) {
      console.error("Erro ao processar lista de soluções:", error);
      return [];
    }
  }, [trail, allSolutions]);

  // Solução do step atual com validação
  const currentSolution = useMemo(() => {
    if (!solutionsList.length || currentStepIdx >= solutionsList.length) return null;
    return solutionsList[currentStepIdx];
  }, [solutionsList, currentStepIdx]);

  // Detectar se já temos trilha ao carregar o componente, com limite de tentativas
  useEffect(() => {
    const checkExistingTrail = async () => {
      try {
        // Se estiver carregando, aguardar
        if (isLoading) return;
        
        // Se já temos soluções carregadas, marcar como iniciado
        if (solutionsList.length > 0) {
          console.log("Trilha já existe com", solutionsList.length, "soluções");
          setStarted(true);
          setLoadingError(false);
          return;
        }
        
        // Se não tem soluções mas temos menos de 3 tentativas, tentar carregar
        if (solutionsList.length === 0 && loadAttempts < 3 && !regenerating) {
          console.log(`Tentativa ${loadAttempts + 1} de carregar trilha`);
          setLoadAttempts(prev => prev + 1);
          setLoadStartTime(Date.now());
          
          try {
            const trailData = await refreshTrail(true);
            
            // Verificar explicitamente se temos soluções
            if (trailData && countTrailSolutions(trailData) > 0) {
              console.log("Trilha carregada com sucesso:", countTrailSolutions(trailData), "soluções");
              setLoadingError(false);
            } else {
              console.log("Trilha carregada, mas sem soluções válidas");
              if (loadAttempts >= 2) {
                setLoadingError(true);
              }
            }
          } catch (error) {
            console.error("Erro ao tentar carregar trilha:", error);
            if (loadAttempts >= 2) {
              setLoadingError(true);
            }
          } finally {
            setLoadStartTime(null);
          }
          return;
        }
        
        if (loadAttempts >= 3 && solutionsList.length === 0) {
          console.log("Número máximo de tentativas excedido e sem soluções");
          setLoadingError(true);
        }
      } catch (error) {
        console.error("Erro ao verificar trilha existente:", error);
        if (loadAttempts >= 2) {
          setLoadingError(true);
        }
      }
    };
    
    checkExistingTrail();
  }, [isLoading, solutionsList.length, refreshTrail, loadAttempts, regenerating]);

  // Function para tentar recarregar dados da trilha
  const refreshTrailData = useCallback(async () => {
    setLoadingError(false);
    setLoadingTimeout(false);
    setLoadStartTime(Date.now());
    
    try {
      await refreshTrail(true);
    } catch (error) {
      console.error("Erro ao atualizar dados da trilha:", error);
      setLoadingError(true);
    } finally {
      setLoadStartTime(null);
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
    setLoadingTimeout(false);
    setLoadStartTime(Date.now());

    try {
      // Tentar obter a trilha novamente do servidor antes de gerar
      await refreshTrail(true);
      
      // Verificar se a trilha já existe e, caso não exista, gerar uma nova
      if (shouldRegenerate) {
        await generateImplementationTrail();
        toast.success("Trilha personalizada gerada com sucesso!");
      }
      
      setStarted(true);
      setCurrentStepIdx(0); // Resetar para o início
      setTypingFinished(false);
    } catch (error) {
      console.error("Erro ao gerar a trilha:", error);
      toast.error("Erro ao gerar a trilha personalizada.");
      setLoadingError(true);
    } finally {
      setRegenerating(false);
      setLoadStartTime(null);
    }
  }, [generateImplementationTrail, refreshTrail]);

  const handleMagicFinish = useCallback(() => {
    setShowMagicExperience(false);
    setStarted(true);
    setCurrentStepIdx(0);
    setTypingFinished(false);
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
    if (!id) {
      console.warn("Tentativa de selecionar solução com ID inválido");
      return;
    }
    
    navigate(`/solution/${id}`);
  }, [navigate]);

  const handleTypingComplete = useCallback(() => {
    setTypingFinished(true);
  }, []);

  // Timeout para evitar carregamento infinito
  useEffect(() => {
    if (!loadStartTime) return;
    
    const timeoutId = setTimeout(() => {
      if (loadStartTime) {
        console.warn("Operação excedeu o tempo limite");
        setLoadingTimeout(true);
        setRegenerating(false);
        setShowMagicExperience(false);
        setLoadStartTime(null);
        toast.error("A operação está demorando mais que o esperado. Tente novamente mais tarde.");
      }
    }, 30000); // 30 segundos
    
    return () => clearTimeout(timeoutId);
  }, [loadStartTime]);

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
    loadingError,
    loadingTimeout,
    handleStartGeneration,
    handleMagicFinish,
    handleNext,
    handlePrevious,
    handleSelectSolution,
    handleTypingComplete,
    refreshTrailData
  };
};
