
import { useParams, useNavigate } from "react-router-dom";

export const useImplementationNavigation = () => {
  const { id, moduleIndex, moduleIdx } = useParams<{ 
    id: string; 
    moduleIndex: string;
    moduleIdx: string;
  }>();
  
  // Normaliza os parâmetros, suportando tanto /implement/:id/:moduleIdx quanto /implementation/:id/:moduleIdx
  const moduleIdxParam = moduleIndex || moduleIdx || "0";
  const moduleIdxNumber = parseInt(moduleIdxParam);
  const navigate = useNavigate();
  
  // Usa consistentemente o padrão /implement/:id/:moduleIdx para navegação
  const basePath = "/implement";
  
  // Navigate to next module
  const handleComplete = () => {
    console.log(`Navegando para o próximo módulo: ${moduleIdxNumber + 1}`);
    navigate(`${basePath}/${id}/${moduleIdxNumber + 1}`);
  };
  
  // Navigate to previous module
  const handlePrevious = () => {
    if (moduleIdxNumber > 0) {
      console.log(`Navegando para o módulo anterior: ${moduleIdxNumber - 1}`);
      navigate(`${basePath}/${id}/${moduleIdxNumber - 1}`);
    } else {
      console.log(`Voltando para a página de solução: ${id}`);
      navigate(`/solution/${id}`);
    }
  };
  
  // Navigate to specific module
  const handleNavigateToModule = (moduleIdx: number) => {
    console.log(`Navegando para o módulo específico: ${moduleIdx}`);
    navigate(`${basePath}/${id}/${moduleIdx}`);
  };
  
  return {
    handleComplete,
    handlePrevious,
    handleNavigateToModule,
    currentModuleIdx: moduleIdxNumber
  };
};
