
import { useParams, useNavigate } from "react-router-dom";

export const useImplementationNavigation = () => {
  const { id, moduleIdx } = useParams<{ 
    id: string; 
    moduleIdx?: string;
  }>();
  
  const moduleIdxNumber = parseInt(moduleIdx || "0");
  const navigate = useNavigate();
  
  // Usar o novo padrão de URL em português
  const basePath = "/solucoes";
  
  // Navigate to next module
  const handleComplete = () => {
    console.log(`Navegando para o próximo módulo: ${moduleIdxNumber + 1}`);
    navigate(`${basePath}/${id}/implementar/${moduleIdxNumber + 1}`);
  };
  
  // Navigate to previous module
  const handlePrevious = () => {
    if (moduleIdxNumber > 0) {
      console.log(`Navegando para o módulo anterior: ${moduleIdxNumber - 1}`);
      navigate(`${basePath}/${id}/implementar/${moduleIdxNumber - 1}`);
    } else {
      console.log(`Voltando para a página de solução: ${id}`);
      navigate(`${basePath}/${id}`);
    }
  };
  
  // Navigate to specific module
  const handleNavigateToModule = (moduleIdx: number) => {
    console.log(`Navegando para o módulo específico: ${moduleIdx}`);
    navigate(`${basePath}/${id}/implementar/${moduleIdx}`);
  };
  
  return {
    handleComplete,
    handlePrevious,
    handleNavigateToModule,
    currentModuleIdx: moduleIdxNumber
  };
};
