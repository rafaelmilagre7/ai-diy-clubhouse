
import React, { useMemo, useCallback } from "react";
import { Module } from "@/lib/supabase";
import { ModuleContentText } from "./ModuleContentText";
import { ContentTypeSwitcher } from "./ContentTypeSwitcher";
import { getContentType } from "./utils/ContentTypeUtils";

interface ModuleContentRendererProps {
  module: Module;
  onInteraction: () => void;
}

export const ModuleContentRenderer = ({ module, onInteraction }: ModuleContentRendererProps) => {
  // FASE 3: Early return para módulos sem conteúdo
  if (!module.content) {
    return (
      <div className="p-8 text-center">
        <p className="text-textSecondary">Nenhum conteúdo disponível para este módulo.</p>
      </div>
    );
  }

  // FASE 3: Memoizar cálculo do tipo de conteúdo
  const contentType = useMemo(() => getContentType(module), [module]);

  // FASE 3: Memoizar handler de interação
  const handleInteraction = useCallback(() => {
    onInteraction();
  }, [onInteraction]);

  // FASE 3: Render otimizado com dados memoizados
  return (
    <div onClick={handleInteraction} className="space-y-8 animate-fade-in">
      {/* Main content text from module */}
      <ModuleContentText content={module.content} />

      {/* Render specific content based on module type */}
      <ContentTypeSwitcher contentType={contentType} module={module} />
    </div>
  );
};
