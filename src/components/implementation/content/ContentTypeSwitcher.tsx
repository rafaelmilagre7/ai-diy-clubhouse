
import React from "react";
import { Module } from "@/lib/supabase";
import { ModuleContentChecklist } from "./ModuleContentChecklist";
import { ModuleContentMaterials } from "./ModuleContentMaterials";
import { ModuleContentTools } from "./ModuleContentTools";
import { ModuleContentVideos } from "./ModuleContentVideos";
import { useLogging } from "@/hooks/useLogging";

interface ContentTypeSwitcherProps {
  contentType: string;
  module: Module;
}

export const ContentTypeSwitcher = ({ contentType, module }: ContentTypeSwitcherProps) => {
  const { log, logError } = useLogging();
  
  log("ContentTypeSwitcher", { 
    moduleId: module.id, 
    moduleType: module.type, 
    contentType, 
    hasContent: !!module.content
  });
  
  try {
    // Render specific components based on module type and content
    return (
      <div className="space-y-8">
        {/* Render módulo-específico tools */}
        <ModuleContentTools module={module} />
        
        {/* Render module-specific materials */}
        <ModuleContentMaterials module={module} />
        
        {/* Render module-specific videos when needed */}
        <ModuleContentVideos module={module} />
        
        {/* Render checklist for modules that need verification */}
        <ModuleContentChecklist module={module} />
      </div>
    );
  } catch (error) {
    logError("Error rendering content type", error);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
        <p className="font-medium">Erro ao renderizar conteúdo</p>
        <p className="text-sm">Ocorreu um problema ao exibir este conteúdo. Por favor, tente novamente mais tarde.</p>
      </div>
    );
  }
};
