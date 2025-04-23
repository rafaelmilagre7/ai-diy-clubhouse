
import React, { useCallback, useEffect, useRef } from "react";
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
  const hasLoggedRef = useRef(false);
  
  // Memoize handler para evitar recriações desnecessárias
  const handleInteraction = useCallback(() => {
    if (module?.id) {
      log("Interação do usuário com módulo", { module_id: module.id });
      onInteraction();
    }
  }, [module?.id, onInteraction, log]);
  
  // Efeito para detectar primeiro carregamento - usando ref para garantir uma só vez
  useEffect(() => {
    if (!hasLoggedRef.current && module?.id) {
      // Registrar renderização do módulo apenas uma vez
      log("Módulo renderizado", { 
        module_id: module.id,
        module_type: module.type,
        module_title: module.title,
        solution_id: module.solution_id
      });
      hasLoggedRef.current = true;
    }
    
    // Limpeza do efeito quando o componente for desmontado
    return () => {
      hasLoggedRef.current = false;
    };
  }, [module?.id, module?.type, module?.title, module?.solution_id, log]);
  
  if (!module) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum módulo disponível para implementação.</p>
      </div>
    );
  }
  
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
