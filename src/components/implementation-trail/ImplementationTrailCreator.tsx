
import React from "react";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { TrailDisplayContent } from "./TrailDisplayContent";
import { TrailEmptyState } from "./TrailEmptyState";
import { TrailLoadingState } from "./TrailLoadingState";
import { TrailErrorFallback } from "./TrailErrorFallback";

export const ImplementationTrailCreator = () => {
  const { 
    trail, 
    isLoading, 
    regenerating, 
    error, 
    hasContent, 
    refreshTrail, 
    generateImplementationTrail 
  } = useImplementationTrail();

  const handleRegenerate = async () => {
    try {
      await generateImplementationTrail();
    } catch (err) {
      console.error('Erro ao regenerar trilha:', err);
    }
  };

  const handleRetry = async () => {
    try {
      await refreshTrail(true);
    } catch (err) {
      console.error('Erro ao recarregar trilha:', err);
    }
  };

  // Estado de carregamento
  if (isLoading || regenerating) {
    return <TrailLoadingState isRegenerating={regenerating} />;
  }

  // Estado de erro
  if (error) {
    return (
      <TrailErrorFallback 
        error={error}
        onRetry={handleRetry}
        onRegenerate={handleRegenerate}
      />
    );
  }

  // Estado vazio - sem trilha ou sem conteúdo
  if (!trail || !hasContent) {
    return <TrailEmptyState onRegenerate={handleRegenerate} />;
  }

  // Estado com conteúdo
  return (
    <TrailDisplayContent 
      trail={trail} 
      onRegenerate={handleRegenerate} 
    />
  );
};
