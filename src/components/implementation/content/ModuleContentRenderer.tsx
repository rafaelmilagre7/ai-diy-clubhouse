
import React from "react";
import { Module } from "@/lib/supabase";
import { ModuleContentText } from "./ModuleContentText";
import { ContentTypeSwitcher } from "./ContentTypeSwitcher";
import { getContentType } from "./utils/ContentTypeUtils";

interface ModuleContentRendererProps {
  module: Module;
  onInteraction: () => void;
}

export const ModuleContentRenderer = ({ module, onInteraction }: ModuleContentRendererProps) => {
  if (!module.content) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum conteúdo disponível para este módulo.</p>
      </div>
    );
  }

  // Determine the content type based on module.type or content structure
  const contentType = getContentType(module);

  // Track user interaction with content
  const handleInteraction = () => {
    onInteraction();
  };

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
