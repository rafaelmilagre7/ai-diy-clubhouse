
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { TrailMagicExperience } from "./TrailMagicExperience";
import { TrailTypingText } from "./TrailTypingText";
import { TrailStepperNavigation } from "./TrailStepperNavigation";
import { TrailCurrentSolutionCard } from "./TrailCurrentSolutionCard";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { toast } from "sonner";

export const TrailGuidedExperience = ({ autoStart = false }) => {
  const {
    trail,
    isLoading: trailLoading,
    refreshTrail,
    generateImplementationTrail,
    hasContent
  } = useImplementationTrail();
  const { solutions, loading: solutionsLoading } = useSolutionsData();
  
  const [started, setStarted] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [typingFinished, setTypingFinished] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showMagicExperience, setShowMagicExperience] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Processar soluções da trilha
  const solutionsList = React.useMemo(() => {
    if (!trail || !solutions || solutions.length === 0) return [];
    
    try {
      const all = [];
      
      // Processar prioridade 1
      if (Array.isArray(trail.priority1)) {
        for (const item of trail.priority1) {
          if (!item || !item.solutionId) continue;
          
          const solution = solutions.find(s => s.id === item.solutionId);
          if (solution) {
            all.push({
              ...item,
              ...solution,
              priority: 1,
              title: solution.title,
              justification: item.justification
            });
          }
        }
      }
      
      // Processar prioridade 2
      if (Array.isArray(trail.priority2)) {
        for (const item of trail.priority2) {
          if (!item || !item.solutionId) continue;
          
          const solution = solutions.find(s => s.id === item.solutionId);
          if (solution) {
            all.push({
              ...item,
              ...solution,
              priority: 2,
              title: solution.title,
              justification: item.justification
            });
          }
        }
      }
      
      // Processar prioridade 3
      if (Array.isArray(trail.priority3)) {
        for (const item of trail.priority3) {
          if (!item || !item.solutionId) continue;
          
          const solution = solutions.find(s => s.id === item.solutionId);
          if (solution) {
            all.push({
              ...item,
              ...solution,
              priority: 3,
              title: solution.title,
              justification: item.justification
            });
          }
        }
      }
      
      return all;
    } catch (error) {
      console.error("Erro ao processar lista de soluções:", error);
      return [];
    }
  }, [trail, solutions]);

  // Solução atual
  const currentSolution = solutionsList[currentStepIdx];

  // Auto-iniciar se configurado
  useEffect(() => {
    if (autoStart && !started && hasContent && solutionsList.length > 0) {
      console.log("Auto-iniciando visualização da trilha");
      setStarted(true);
    }
  }, [autoStart, started, hasContent, solutionsList.length]);

  // Carregar trilha e começar quando tudo estiver pronto
  useEffect(() => {
    if (!started && !trailLoading && !solutionsLoading && hasContent) {
      setStarted(true);
    }
  }, [started, trailLoading, solutionsLoading, hasContent]);

  // Lidar com trilha vazia ou erro
  useEffect(() => {
    if (started && !trailLoading && !solutionsLoading && solutionsList.length === 0) {
      setLoadingError(true);
    } else {
      setLoadingError(false);
    }
  }, [started, trailLoading, solutionsLoading, solutionsList.length]);

  const handleStartGeneration = async () => {
    setShowMagicExperience(true);
    setRegenerating(true);
    try {
      await generateImplementationTrail();
      toast.success("Trilha gerada com sucesso!");
      setStarted(true);
      setCurrentStepIdx(0);
      setTypingFinished(false);
    } catch (error) {
      console.error("Erro ao gerar trilha:", error);
      toast.error("Erro ao gerar trilha personalizada");
      setLoadingError(true);
    } finally {
      setRegenerating(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refreshTrail(true);
  };

  const handleMagicFinish = () => {
    setShowMagicExperience(false);
    setStarted(true);
  };

  const handleNext = () => {
    if (currentStepIdx < solutionsList.length - 1) {
      setCurrentStepIdx(v => v + 1);
      setTypingFinished(false);
    }
  };

  const handlePrevious = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(v => v - 1);
      setTypingFinished(false);
    }
  };

  const handleSelectSolution = (id) => {
    window.location.href = `/solution/${id}`;
  };

  const handleTypingComplete = () => {
    setTypingFinished(true);
  };

  if (showMagicExperience) {
    return <TrailMagicExperience onFinish={handleMagicFinish} />;
  }

  if (trailLoading || solutionsLoading || regenerating) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="h-8 w-8 text-[#0ABAB5] animate-spin" />
        <span className="font-medium text-[#0ABAB5]">
          {regenerating 
            ? "Milagrinho está preparando sua trilha personalizada..." 
            : "Carregando sua trilha personalizada..."}
        </span>
        {retryCount > 1 && (
          <div className="mt-3 text-center max-w-md">
            <p className="text-sm text-gray-600 mb-2">
              Este processo está demorando mais do que o esperado. 
              Você pode tentar novamente ou voltar mais tarde.
            </p>
            <Button 
              variant="outline"
              onClick={handleRetry}
              className="mt-1"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="max-w-xl mx-auto p-6 border rounded-lg bg-amber-50 border-amber-200">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle size={32} className="text-amber-500" />
          <h3 className="text-lg font-medium text-gray-800">Erro ao carregar trilha</h3>
          <p className="text-gray-600">
            Encontramos um problema ao carregar sua trilha personalizada. 
            Por favor, tente novamente ou entre em contato com o suporte.
          </p>
          <div className="flex gap-3 mt-2">
            <Button 
              onClick={handleStartGeneration} 
              className="bg-[#0ABAB5] text-white"
            >
              Gerar Nova Trilha
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRetry}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-xl mx-auto space-y-6 text-center">
        <h2 className="text-3xl font-bold text-[#0ABAB5]">Bem-vindo à Geração da Trilha VIVER DE IA</h2>
        <p className="text-gray-700">
          Clique no botão abaixo para gerar sua trilha personalizada de soluções de IA, selecionadas especialmente para o seu negócio.
        </p>
        <Button
          className="bg-[#0ABAB5] text-white px-8 py-3 text-lg"
          onClick={handleStartGeneration}
          disabled={regenerating}
        >
          {regenerating ? "Gerando trilha..." : "Gerar Trilha VIVER DE IA"}
        </Button>
      </div>
    );
  }

  if (solutionsList.length === 0) {
    return (
      <div className="text-center text-gray-700 py-12">
        <AlertCircle size={32} className="text-amber-500 mx-auto mb-3" />
        <p className="mb-4">Nenhuma solução recomendada foi encontrada. Por favor, tente regenerar a trilha.</p>
        <div className="mt-4">
          <Button onClick={handleStartGeneration} className="bg-[#0ABAB5] text-white">
            Regenerar Trilha
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="text-3xl font-extrabold text-[#0ABAB5] text-center">
        Sua Trilha Personalizada VIVER DE IA
      </h2>
      <div className="space-y-6 border rounded-2xl p-6 bg-gradient-to-br from-[#0ABAB5]/10 to-white shadow animate-fade-in">
        <TrailTypingText 
          key={`solution-text-${currentStepIdx}`} 
          text={currentSolution?.justification || "Carregando recomendação..."} 
          onComplete={handleTypingComplete} 
        />
        <TrailCurrentSolutionCard 
          solution={currentSolution} 
          onSelect={handleSelectSolution} 
        />
        <TrailStepperNavigation
          currentStepIdx={currentStepIdx}
          stepsLength={solutionsList.length}
          typingFinished={typingFinished}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>
    </div>
  );
};
