
import React, { useEffect } from "react";
import { Module } from "@/lib/supabase";
import LandingModule from "./LandingModule";
import CelebrationModule from "./CelebrationModule";
import DefaultModule from "./DefaultModule";
import { shouldAutoComplete } from "./content/ContentManager";
import { useLogging } from "@/hooks/useLogging";

interface ModuleContentProps {
  module: Module | null;
  onComplete: () => void;
  onError?: (error: any) => void;
  onInteraction?: () => void;
}

export const ModuleContent = ({ module, onComplete, onError, onInteraction }: ModuleContentProps) => {
  const { log, logError } = useLogging();
  
  // Não fazer auto-complete aqui, deixar para os componentes individuais decidirem
  useEffect(() => {
    if (module) {
      log("Renderizando conteúdo do módulo", { 
        module_id: module.id, 
        module_type: module.type,
        module_title: module.title 
      });
    }
  }, [module, log]);

  if (!module) {
    log("Nenhum módulo fornecido para ModuleContent");
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum módulo disponível.</p>
      </div>
    );
  }
  
  try {
    log("Renderizando módulo", { module_type: module.type });
    
    return (
      <div className="animate-fade-in">
        {(() => {
          switch (module.type) {
            case "landing":
              return <LandingModule module={module} onComplete={onComplete} />;
            case "celebration":
              return <CelebrationModule module={module} onComplete={onComplete} />;
            default:
              return (
                <DefaultModule 
                  module={module} 
                  onComplete={onComplete}
                  onInteraction={onInteraction}
                />
              );
          }
        })()}
      </div>
    );
  } catch (error) {
    logError("Erro ao renderizar conteúdo do módulo", error);
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
