
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Module, Solution } from "@/types/solution";
import { useLogging } from "@/hooks/useLogging";

export const useModuleImplementation = (
  solution: Solution | null,
  moduleIdx: number
) => {
  const { log, logError } = useLogging("useModuleImplementation");
  const navigate = useNavigate();
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  
  // Efeito para configurar os módulos quando a solução mudar
  useEffect(() => {
    if (solution && solution.modules && Array.isArray(solution.modules) && solution.modules.length > 0) {
      const sortedModules = [...solution.modules].sort((a, b) => a.module_order - b.module_order);
      setModules(sortedModules);
      
      // Definir o módulo atual baseado no índice fornecido
      if (moduleIdx < sortedModules.length) {
        setCurrentModule(sortedModules[moduleIdx]);
      } else if (sortedModules.length > 0) {
        // Se o índice está fora dos limites, usar o primeiro módulo
        setCurrentModule(sortedModules[0]);
        log("Índice de módulo fora dos limites, usando o primeiro módulo", { 
          requestedIdx: moduleIdx, 
          maxIdx: sortedModules.length - 1 
        });
      }
    } else {
      setModules([]);
      setCurrentModule(null);
    }
  }, [solution, moduleIdx, log]);
  
  // Verificar se este é o último módulo
  const isLastModule = modules.length > 0 ? moduleIdx === modules.length - 1 : false;
  
  // Função para navegar entre módulos
  const handleModuleChange = useCallback((newModuleIdx: number) => {
    if (solution) {
      if (newModuleIdx >= 0 && newModuleIdx < modules.length) {
        log("Navegando para o módulo", { 
          fromModuleIdx: moduleIdx, 
          toModuleIdx: newModuleIdx,
          moduleId: modules[newModuleIdx]?.id 
        });
        navigate(`/implement/${solution.id}/${newModuleIdx}`);
      } else if (newModuleIdx < 0) {
        // Se o usuário tenta ir para um módulo com índice negativo, redirecionar para a página da solução
        log("Navegando de volta para a página da solução");
        navigate(`/solution/${solution.id}`);
      } else if (newModuleIdx >= modules.length) {
        // Se o usuário tenta ir para um módulo após o último, considerar como conclusão
        log("Tentando ir além do último módulo, potencial conclusão");
        navigate(`/solution/${solution.id}/completion`);
      }
    }
  }, [solution, modules, moduleIdx, navigate, log]);
  
  return {
    currentModule,
    modules,
    isLastModule,
    handleModuleChange
  };
};
