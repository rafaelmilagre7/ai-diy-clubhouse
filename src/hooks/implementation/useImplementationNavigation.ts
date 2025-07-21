
import { useParams, useNavigate } from "react-router-dom";

export const useImplementationNavigation = () => {
  const { id, moduleIndex, moduleIdx } = useParams<{ 
    id: string; 
    moduleIndex: string;
    moduleIdx: string;
  }>();
  
  // Normaliza os parâmetros, suportando tanto /implement/:id/:moduleIdx quanto /implementation/:id/:moduleIdx
  const stepIdxParam = moduleIndex || moduleIdx || "0";
  const stepIdxNumber = parseInt(stepIdxParam);
  const navigate = useNavigate();
  
  // Usa consistentemente o padrão /implement/:id/:stepIdx para navegação
  const basePath = "/implement";
  
  // Navigate to next step
  const handleComplete = () => {
    console.log(`Navegando para a próxima etapa: ${stepIdxNumber + 1}`);
    navigate(`${basePath}/${id}/${stepIdxNumber + 1}`);
  };
  
  // Navigate to previous step
  const handlePrevious = () => {
    if (stepIdxNumber > 0) {
      console.log(`Navegando para a etapa anterior: ${stepIdxNumber - 1}`);
      navigate(`${basePath}/${id}/${stepIdxNumber - 1}`);
    } else {
      console.log(`Voltando para a página de solução: ${id}`);
      navigate(`/solution/${id}`);
    }
  };
  
  // Navigate to specific step
  const handleNavigateToModule = (stepIdx: number) => {
    console.log(`Navegando para a etapa específica: ${stepIdx}`);
    navigate(`${basePath}/${id}/${stepIdx}`);
  };
  
  return {
    handleComplete,
    handlePrevious,
    handleNavigateToModule,
    currentModuleIdx: stepIdxNumber
  };
};
