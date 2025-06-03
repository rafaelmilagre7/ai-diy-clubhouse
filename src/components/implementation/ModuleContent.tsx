
import React, { useEffect } from "react";
import { Module, Solution } from "@/lib/supabase";
import { LandingModule } from "./LandingModule";
import { CelebrationModule } from "./CelebrationModule";
import { DefaultModule } from "./DefaultModule";
import { SolutionFallbackContent } from "./SolutionFallbackContent";
import { shouldAutoComplete } from "./content/ContentManager";
import { useLogging } from "@/hooks/useLogging";

interface ModuleContentProps {
  module: Module | null;
  solution?: Solution | null;
  onComplete: () => void;
  onError?: (error: any) => void;
}

export const ModuleContent = ({ module, solution, onComplete, onError }: ModuleContentProps) => {
  const { log, logError } = useLogging();
  
  // Mark landing and celebration modules as automatically interacted with
  useEffect(() => {
    if (module && shouldAutoComplete(module)) {
      log("Auto-completing module", { module_id: module.id, module_type: module.type });
      onComplete();
    }
  }, [module, onComplete, log]);

  // Se não há módulo mas há solução, usar fallback
  if (!module && solution) {
    log("No modules found, using solution fallback content", { solution_id: solution.id });
    return <SolutionFallbackContent solution={solution} onComplete={onComplete} />;
  }

  // Se não há módulo nem solução, mostrar erro
  if (!module) {
    log("No module or solution provided to ModuleContent");
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Erro ao carregar conteúdo
        </h3>
        <p className="text-red-700">
          Nenhum conteúdo disponível para exibir.
        </p>
      </div>
    );
  }

  // Verificar se é um módulo placeholder (sem conteúdo real)
  const isPlaceholderModule = module.id.startsWith('placeholder-') || 
                              !module.content || 
                              Object.keys(module.content).length === 0;

  if (isPlaceholderModule && solution) {
    log("Placeholder module detected, using solution fallback", { 
      module_id: module.id, 
      solution_id: solution.id 
    });
    return <SolutionFallbackContent solution={solution} onComplete={onComplete} />;
  }
  
  try {
    // Renderiza o conteúdo apropriado com base no tipo do módulo
    log("Rendering module content", { module_type: module.type });
    
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
