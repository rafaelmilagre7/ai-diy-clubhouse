
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { TrailMagicExperience } from "./TrailMagicExperience";
import { TrailTypingText } from "./TrailTypingText";
import { TrailStepperNavigation } from "./TrailStepperNavigation";
import { TrailCurrentSolutionCard } from "./TrailCurrentSolutionCard";

// Componente principal refatorado
export const TrailGuidedExperience = () => {
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
  const currentSolution = solutionsList[currentStepIdx];

  // Handler para iniciar a geração da trilha
  const handleStartGeneration = async () => {
    setShowMagicExperience(true);
    setRegenerating(true);

    try {
      await generateImplementationTrail();
      toast.success("Trilha personalizada gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar a trilha:", error);
      toast.error("Erro ao gerar a trilha personalizada.");
    }
  };

  const handleMagicFinish = () => {
    setShowMagicExperience(false);
    setStarted(true);
    setCurrentStepIdx(0);
    setTypingFinished(false);
    setRegenerating(false);
  };

  const handleNext = () => {
    if (!typingFinished) return;
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

  const handleSelectSolution = (id: string) => {
    navigate(`/solution/${id}`);
  };

  if (showMagicExperience) {
    return <TrailMagicExperience onFinish={handleMagicFinish} />;
  }

  if (isLoading || regenerating || solutionsLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="h-8 w-8 text-[#0ABAB5] animate-spin" />
        <span className="font-medium text-[#0ABAB5]">Milagrinho está preparando sua trilha personalizada...</span>
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
        Nenhuma solução recomendada foi encontrada. Por favor, tente regenerar a trilha.
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
        <TrailTypingText text={currentSolution?.justification || "Carregando recomendação..."} onComplete={() => setTypingFinished(true)} />
        <TrailCurrentSolutionCard solution={currentSolution} onSelect={handleSelectSolution} />
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
