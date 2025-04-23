
import React, { useEffect, useRef } from "react";
import { Module, Solution } from "@/types/solution";
import { ModuleTitle } from "./ModuleTitle";
import { ModuleContentRenderer } from "./content/ModuleContentRenderer";
import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";
import { useLogging } from "@/hooks/useLogging";

interface ModuleContentProps {
  module: Module | null;
  onComplete: () => void;
  onError?: (error: any) => void;
  solution?: Solution;
  activeTab?: string;
  moduleIdx?: number;
}

export const ModuleContent = ({ module, onComplete, onError, solution, activeTab }: ModuleContentProps) => {
  const { log, logError } = useLogging();
  const hasAutoCompletedRef = useRef(false);
  
  // Resetar a flag de autocompletar quando o módulo mudar
  useEffect(() => {
    hasAutoCompletedRef.current = false;
  }, [module?.id]);
  
  // Mark landing and celebration modules as automatically interacted with
  useEffect(() => {
    if (module && shouldAutoComplete(module.type) && !hasAutoCompletedRef.current) {
      log("Auto-completing module", { module_id: module.id, module_type: module.type });
      
      // Usar um pequeno timeout para evitar problemas de renderização
      const timer = setTimeout(() => {
        hasAutoCompletedRef.current = true;
        onComplete();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [module, onComplete, log]);

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
        <h2 className="text-2xl font-semibold mb-6">
          <ModuleTitle type={module.type} />
        </h2>
        
        <ModuleContentRenderer 
          module={module}
          onInteraction={onComplete}
        />
        
        <div className="pt-6 border-t mt-10">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full flex items-center justify-center gap-2"
            onClick={onComplete}
          >
            <CheckSquare className="h-5 w-5" />
            Concluir este módulo
          </Button>
          <p className="text-sm text-center text-muted-foreground mt-2">
            Confirme que você concluiu este módulo para poder continuar.
          </p>
        </div>
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

// Função para determinar se um módulo deve ser marcado como concluído automaticamente
function shouldAutoComplete(moduleType: string): boolean {
  return ['landing', 'celebration'].includes(moduleType);
}
