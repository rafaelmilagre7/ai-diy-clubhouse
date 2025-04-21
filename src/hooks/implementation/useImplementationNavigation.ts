
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
    navigate(`${basePath}/${id}/${moduleIdxNumber + 1}`);
  };
  
  // Navigate to previous module
  const handlePrevious = () => {
    if (moduleIdxNumber > 0) {
      navigate(`${basePath}/${id}/${moduleIdxNumber - 1}`);
    } else {
      navigate(`/solution/${id}`);
    }
  };
  
  return {
    handleComplete,
    handlePrevious
  };
};
