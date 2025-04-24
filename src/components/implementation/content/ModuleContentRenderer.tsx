
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
  
  useEffect(() => {
    if (!hasLoggedRef.current && module?.id) {
      log("Módulo renderizado", { 
        module_id: module.id,
        module_type: module.type,
        module_title: module.title,
        solution_id: module.solution_id
      });
      hasLoggedRef.current = true;
    }
    
    return () => {
      hasLoggedRef.current = false;
    };
  }, [module?.id, module?.type, module?.title, module?.solution_id, log]);
  
  if (!module) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">
          Nenhum módulo disponível para implementação.
        </p>
      </div>
    );
  }
  
  if (!module.content) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">
          Nenhum conteúdo disponível para este módulo.
        </p>
      </div>
    );
  }

  // Determine o tipo de conteúdo baseado no tipo do módulo
  const contentType = getContentType(module);

  return (
    <div onClick={handleInteraction} className="space-y-8">
      {/* Texto principal do módulo */}
      <ModuleContentText content={module.content} />

      {/* Renderiza conteúdo específico baseado no tipo do módulo */}
      <ContentTypeSwitcher contentType={contentType} module={module} />
    </div>
  );
};
