
import { useParams, useNavigate } from "react-router-dom";

export const useImplementationNavigation = () => {
  const { id, moduleIndex, moduleIdx } = useParams<{ 
    id: string; 
    moduleIndex: string;
    moduleIdx: string;
  }>();
  
  // Normaliza os parâmetros, suportando tanto /implementation/:id quanto /implementation/:id/:moduleIdx
  const moduleIdxParam = moduleIndex || moduleIdx || "0";
  const moduleIdxNumber = parseInt(moduleIdxParam);
  const navigate = useNavigate();
  
  // Usa consistentemente o padrão /implementation/:id para navegação
  const basePath = "/implementation";
  
  // Navigate to next module (caso futuramente tenhamos navegação por módulos)
  const handleComplete = () => {
    console.log(`Implementação concluída para solução: ${id}`);
    navigate(`/implementation/completed/${id}`);
  };
  
  // Navigate to previous module or back to solution
  const handlePrevious = () => {
    console.log(`Voltando para a página de solução: ${id}`);
    navigate(`/solution/${id}`);
  };
  
  // Navigate to specific module (placeholder para funcionalidade futura)
  const handleNavigateToModule = (moduleIdx: number) => {
    console.log(`Navegação por módulos não implementada ainda: ${moduleIdx}`);
    // Para futuras implementações com módulos específicos
  };
  
  return {
    handleComplete,
    handlePrevious,
    handleNavigateToModule,
    currentModuleIdx: moduleIdxNumber
  };
};
