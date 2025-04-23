
import React, { useCallback } from "react";
import { Module } from "@/lib/supabase";
import { ModuleContentText } from "./ModuleContentText";
import { ContentTypeSwitcher } from "./ContentTypeSwitcher";
import { getContentType } from "./utils/ContentTypeUtils";
import { useLogging } from "@/hooks/useLogging";

interface ModuleContentRendererProps {
  module: Module;
  onInteraction: () => void;
}

export const ModuleContentRenderer = ({ module, onInteraction }: ModuleContentRendererProps) => {
  const { log } = useLogging("ModuleContentRenderer");
  
  // Memoize handler para evitar recriações desnecessárias
  const handleInteraction = useCallback(() => {
    log("Interação do usuário com módulo", { module_id: module.id });
    onInteraction();
  }, [module.id, onInteraction, log]);
  
  if (!module.content) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum conteúdo disponível para este módulo.</p>
      </div>
    );
  }

  // Determine the content type based on module.type or content structure
  const contentType = getContentType(module);

  // Render appropriate content based on content type
  return (
    <div onClick={handleInteraction} className="space-y-8">
      {/* Main content text from module */}
      <ModuleContentText content={module.content} />

      {/* Render specific content based on module type */}
      <ContentTypeSwitcher contentType={contentType} module={module} />
    </div>
  );
};
