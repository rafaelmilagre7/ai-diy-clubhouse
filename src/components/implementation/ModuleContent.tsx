
import React, { useEffect } from "react";
import { Module } from "@/lib/supabase";
import { LandingModule } from "./LandingModule";
import { CelebrationModule } from "./CelebrationModule";
import { DefaultModule } from "./DefaultModule";
import { shouldAutoComplete } from "./content/ContentManager";
import { useLogging } from "@/hooks/useLogging";

interface ModuleContentProps {
  module: Module | null;
  onComplete: () => void;
  onInteraction?: () => void;
  onError?: (error: any) => void;
}

export const ModuleContent = ({ module, onComplete, onInteraction, onError }: ModuleContentProps) => {
  const { log, logError } = useLogging();
  
  // Mark landing and celebration modules as automatically interacted with
  useEffect(() => {
    if (module && shouldAutoComplete(module)) {
      log("Auto-completing module", { module_id: module.id, module_type: module.type });
      
      // Mark as interacted first, then complete
      if (onInteraction) {
        onInteraction();
      }
      
      onComplete();
    }
  }, [module, onComplete, onInteraction, log]);

  if (!module) {
    log("No module provided to ModuleContent");
    return null;
  }
  
  try {
    // Renderiza o conteúdo apropriado com base no tipo do módulo
    log("Rendering module content", { module_type: module.type });
    // Microanimação suave na troca de módulo (fade-in)
    return (
      <div className="animate-fade-in">
        {(() => {
          switch (module.type) {
            case "landing":
              return <LandingModule module={module} onComplete={onComplete} />;
            case "celebration":
              return <CelebrationModule module={module} onComplete={onComplete} />;
            default:
              return <DefaultModule module={module} onComplete={onComplete} />;
          }
        })()}
      </div>
    );
  } catch (error) {
    logError("Error rendering module content", error);
    if (onError) {
      onError(error);
    }
    
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Erro ao exibir conteúdo
        </h3>
        <p className="text-red-700">
          Ocorreu um erro ao carregar o conteúdo deste módulo. Por favor, recarregue a página ou tente novamente mais tarde.
        </p>
      </div>
    );
  }
};
