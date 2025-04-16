
import React from "react";
import { Module } from "@/lib/supabase";
import { ModuleContentText } from "./ModuleContentText";
import { ModuleContentTools } from "./ModuleContentTools";
import { ModuleContentMaterials } from "./ModuleContentMaterials";
import { ModuleContentVideos } from "./ModuleContentVideos";
import { ModuleContentChecklist } from "./ModuleContentChecklist";

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
      {contentType === "tools" && <ModuleContentTools module={module} />}
      {contentType === "materials" && <ModuleContentMaterials module={module} />}
      {contentType === "videos" && <ModuleContentVideos module={module} />}
      {contentType === "checklist" && <ModuleContentChecklist module={module} />}
    </div>
  );
};

// Helper function to determine content type from module
const getContentType = (module: Module): string => {
  const type = module.type;
  
  // Map module types to content types
  switch (type) {
    case "preparation":
      return "tools";
    case "implementation":
      return "materials";
    case "verification":
      return "checklist";
    case "results":
      return "videos";
    default:
      return "text";
  }
};
