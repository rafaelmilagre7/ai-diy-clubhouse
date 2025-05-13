
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTrailGuidedExperience } from "@/hooks/implementation/useTrailGuidedExperience";
import { TrailMagicExperience } from "./TrailMagicExperience";
import { TrailTypingText } from "./TrailTypingText";
import { TrailStepperNavigation } from "./TrailStepperNavigation";
import { TrailCurrentSolutionCard } from "./TrailCurrentSolutionCard";

export const TrailGuidedExperience = ({ autoStart = false }) => {
  const navigate = useNavigate();
  const {
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
    refreshTrailData,
  } = useTrailGuidedExperience();

  // Auto-iniciar se configurado
  useEffect(() => {
    if (autoStart && !started && hasContent && solutionsList.length > 0) {
      console.log("Auto-iniciando visualização da trilha");
      handleStartGeneration(false);
    }
  }, [autoStart, started, hasContent, solutionsList.length, handleStartGeneration]);

  // Carregar trilha e começar quando tudo estiver pronto
  useEffect(() => {
    if (!started && !isLoading && !solutionsLoading && hasContent) {
      handleStartGeneration(false);
    }
  }, [started, isLoading, solutionsLoading, hasContent, handleStartGeneration]);

  if (showMagicExperience) {
    return <TrailMagicExperience onFinish={handleMagicFinish} />;
  }

  if (isLoading || solutionsLoading || regenerating || refreshing) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="trail-loading-pulse">
          <Loader2 className="h-12 w-12 text-[#0ABAB5] animate-spin" />
        </div>
        <span className="text-lg font-medium text-[#0ABAB5]">
          {regenerating 
            ? "Milagrinho está preparando sua trilha personalizada..." 
            : refreshing
              ? "Atualizando dados da trilha..."
              : "Carregando sua trilha personalizada..."}
        </span>
        <p className="text-neutral-400 text-center max-w-md">
          Estamos analisando seu perfil e identificando as melhores soluções para seu negócio
        </p>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="max-w-xl mx-auto p-6 border rounded-lg bg-red-900/10 border-red-900/30">
        <div className="flex flex-col items-center gap-4 text-center py-6">
          <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h3 className="text-xl font-medium text-neutral-100">Erro ao carregar trilha</h3>
          <p className="text-neutral-400 max-w-md">
            Encontramos um problema ao carregar sua trilha personalizada. 
            Por favor, tente novamente ou entre em contato com o suporte.
          </p>
          <div className="flex gap-3 mt-4">
            <Button 
              onClick={() => handleStartGeneration(true)} 
              className="bg-gradient-to-r from-[#0ABAB5] to-[#34D399] hover:from-[#0ABAB5]/90 hover:to-[#34D399]/90"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Nova Trilha
            </Button>
            <Button 
              variant="outline" 
              onClick={refreshTrailData}
              className="border-neutral-700 hover:border-neutral-600"
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
      <div className="max-w-xl mx-auto space-y-6 p-8 bg-gradient-to-br from-[#151823] to-[#1A1E2E] rounded-2xl border border-[#0ABAB5]/20 shadow-lg text-center">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#0ABAB5]/20 to-[#34D399]/10 rounded-full flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-[#0ABAB5]" />
        </div>
        
        <h2 className="text-2xl font-bold text-white">Trilha de Implementação VIVER DE IA</h2>
        
        <p className="text-neutral-400">
          Clique no botão abaixo para gerar sua trilha personalizada de soluções de IA, 
          selecionadas especialmente para o seu negócio com base no seu perfil.
        </p>
        
        <Button
          className="bg-gradient-to-r from-[#0ABAB5] to-[#34D399] hover:from-[#0ABAB5]/90 hover:to-[#34D399]/90 px-8 py-6 text-lg h-auto mt-6"
          onClick={() => handleStartGeneration(true)}
          disabled={regenerating}
        >
          <Sparkles className="h-5 w-5 mr-3" />
          {regenerating ? "Gerando trilha..." : "Gerar Trilha Personalizada"}
        </Button>
      </div>
    );
  }

  if (solutionsList.length === 0) {
    return (
      <div className="text-center text-neutral-300 py-12 max-w-lg mx-auto bg-[#151823] border border-neutral-800 rounded-xl p-8">
        <AlertCircle size={40} className="text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">Nenhuma solução encontrada</h3>
        <p className="mb-6 text-neutral-400">Não encontramos soluções recomendadas para seu perfil. Por favor, tente regenerar a trilha.</p>
        <div className="mt-4">
          <Button onClick={() => handleStartGeneration(true)} className="bg-gradient-to-r from-[#0ABAB5] to-[#34D399] hover:from-[#0ABAB5]/90 hover:to-[#34D399]/90">
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerar Trilha
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-[#0ABAB5] via-[#34D399] to-[#0ABAB5] bg-clip-text text-transparent text-center">
        Sua Trilha Personalizada VIVER DE IA
      </h2>
      
      <div className="space-y-6 border rounded-2xl p-8 bg-gradient-to-br from-[#151823] to-[#1A1E2E] border-[#0ABAB5]/20 shadow-lg animate-fade-in">
        <TrailTypingText 
          key={`solution-text-${currentStepIdx}`} 
          text={currentSolution?.justification || "Carregando recomendação..."} 
          onComplete={handleTypingComplete} 
        />
        
        {currentSolution && (
          <div className="transform hover:scale-[1.01] transition-all">
            <TrailCurrentSolutionCard 
              solution={currentSolution} 
              onSelect={handleSelectSolution} 
            />
          </div>
        )}
        
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
