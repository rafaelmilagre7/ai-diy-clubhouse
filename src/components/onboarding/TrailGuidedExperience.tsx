
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { TrailSolutionCard } from "@/components/dashboard/TrailSolutionCard";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSolutionsData } from "@/hooks/useSolutionsData";

// Componente que exibe texto estilo "typing" para a justificativa dinamicamente
const TypingText = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!text || index >= text.length) {
      if (index >= text.length) {
        onComplete && onComplete();
      }
      return;
    }
    const timeout = setTimeout(() => {
      setDisplayText(text.substring(0, index + 1));
      setIndex(index + 1);
    }, 30);
    return () => clearTimeout(timeout);
  }, [index, text, onComplete]);

  return (
    <p className="text-gray-700 text-center text-base min-h-[4rem] max-w-3xl mx-auto px-4 select-text whitespace-pre-wrap">{displayText}</p>
  );
};

export const TrailGuidedExperience = () => {
  const navigate = useNavigate();
  const { trail, isLoading, generateImplementationTrail } = useImplementationTrail();
  const { solutions: allSolutions, loading: solutionsLoading } = useSolutionsData(); // Buscamos todas as soluções disponíveis
  const [started, setStarted] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0); // passo da leitura da trilha (card atual)
  const [typingFinished, setTypingFinished] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Montar lista de soluções ordenadas para a navegação, juntando dados da recomendação com dados reais das soluções
  const solutionsList = useMemo(() => {
    if (!trail || !allSolutions || allSolutions.length === 0) return [];
    const all: any[] = [];
    
    ["priority1", "priority2", "priority3"].forEach((priorityKey, idx) => {
      const items = (trail as any)[priorityKey] || [];
      
      items.forEach(item => {
        // Procura a solução completa pelo ID para obter todos os dados
        const fullSolution = allSolutions.find(s => s.id === item.solutionId);
        
        if (fullSolution) {
          all.push({
            ...item,
            ...fullSolution, // Adiciona todos os dados da solução original
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
    
    // Ordena exatamente por prioridade, depois talvez por ordem fixa (ex: título)
    all.sort((a, b) => a.priority - b.priority);
    console.log("Lista de soluções montada:", all);
    return all;
  }, [trail, allSolutions]);

  // Pega o card atual para mostrar justificativa de IA
  const currentSolution = solutionsList[currentStepIdx];

  // Handler para iniciar a geração da trilha
  const handleStartGeneration = async () => {
    setRegenerating(true);
    try {
      await generateImplementationTrail();
      setStarted(true);
      setCurrentStepIdx(0);
      setTypingFinished(false);
      toast.success("Trilha personalizada gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar a trilha:", error);
      toast.error("Erro ao gerar a trilha personalizada.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleNext = () => {
    if (!typingFinished) {
      // Se digitação não terminou, não avança ainda
      return;
    }
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
        <TypingText text={currentSolution?.justification || "Carregando recomendação..."} onComplete={() => setTypingFinished(true)} />
        {currentSolution && (
          <TrailSolutionCard
            solution={{
              ...currentSolution,
              title: currentSolution.title || "Solução sem título",
              justification: currentSolution.justification,
              solutionId: currentSolution.solutionId,
              description: currentSolution.description,
              priority: currentSolution.priority
            }}
            onClick={handleSelectSolution}
          />
        )}
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIdx === 0}
          >
            Anterior
          </Button>
          {currentStepIdx < solutionsList.length - 1 ? (
            <Button onClick={handleNext} disabled={!typingFinished}>
              Próximo
            </Button>
          ) : (
            <Button onClick={() => navigate("/dashboard")}>
              Finalizar e Ir para Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
