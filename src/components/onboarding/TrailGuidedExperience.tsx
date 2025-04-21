
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { TrailMagicExperience } from "./TrailMagicExperience";
import { TrailTypingText } from "./TrailTypingText";
import { TrailStepperNavigation } from "./TrailStepperNavigation";
import { TrailCurrentSolutionCard } from "./TrailCurrentSolutionCard";
import { useTrailGuidedExperience } from "@/hooks/implementation/useTrailGuidedExperience";

// Componente principal refatorado
export const TrailGuidedExperience = ({ autoStart = false }) => {
  const {
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
  } = useTrailGuidedExperience();

  // Iniciar geração automaticamente se autoStart for true
  useEffect(() => {
    if (autoStart && !started && !isLoading && !regenerating && !showMagicExperience && solutionsList.length === 0) {
      console.log("Iniciando geração automática da trilha");
      handleStartGeneration(true);
    }
  }, [autoStart, started, isLoading, regenerating, showMagicExperience, solutionsList.length, handleStartGeneration]);

  // Se já temos soluções mas não iniciou, auto-iniciar a visualização
  useEffect(() => {
    if (solutionsList.length > 0 && !started && !isLoading && !regenerating && !showMagicExperience) {
      console.log("Iniciando visualização automática da trilha existente");
      // Setamos started = true diretamente no componente
      handleStartGeneration(false); // false indica que não precisamos regenerar
    }
  }, [solutionsList, started, isLoading, regenerating, showMagicExperience, handleStartGeneration]);

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
          onClick={() => handleStartGeneration(true)}
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
          <Button onClick={() => handleStartGeneration(true)} className="bg-[#0ABAB5] text-white">
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
        {/* Componente de texto digitado - reinicia quando muda current solution */}
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
