
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useLogging } from "@/hooks/useLogging";

export const useImplementationNavigation = () => {
  const { id, moduleIndex, moduleIdx } = useParams<{ 
    id: string; 
    moduleIndex: string;
    moduleIdx: string;
  }>();
  
  const { log } = useLogging("useImplementationNavigation");
  
  // Normaliza os parâmetros, suportando tanto /implement/:id/:moduleIdx quanto /implementation/:id/:moduleIdx
  const moduleIdxParam = moduleIndex || moduleIdx || "0";
  const moduleIdxNumber = parseInt(moduleIdxParam);
  const navigate = useNavigate();
  
  // Usa consistentemente o padrão /implement/:id/:moduleIdx para navegação
  const basePath = "/implement";
  
  // Verificar se temos um ID válido
  useEffect(() => {
    if (!id) {
      log("ID da implementação não encontrado, redirecionando para dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [id, navigate, log]);

  // Corrigir problemas de URL inconsistente
  useEffect(() => {
    const path = window.location.pathname;
    
    // Só fazer correção se precisar
    if (path.includes("/implementation/") || 
        (path.includes("/implement/") && !path.includes(`/${moduleIdxNumber}`))) {
      // URL incorreta, vamos corrigir de forma silenciosa
      const correctPath = `${basePath}/${id}/${moduleIdxNumber}`;
      log("Corrigindo URL de implementação", { from: path, to: correctPath });
      navigate(correctPath, { replace: true });
    }
  }, [id, moduleIdxNumber, navigate, log]);
  
  // Navigate to next module
  const handleComplete = () => {
    navigate(`${basePath}/${id}/${moduleIdxNumber + 1}`, { replace: true });
  };
  
  // Navigate to previous module
  const handlePrevious = () => {
    if (moduleIdxNumber > 0) {
      navigate(`${basePath}/${id}/${moduleIdxNumber - 1}`, { replace: true });
    } else {
      navigate(`/solutions/${id}`, { replace: true });
    }
  };
  
  // Navigate to specific module
  const handleNavigateToModule = (moduleIdx: number) => {
    navigate(`${basePath}/${id}/${moduleIdx}`, { replace: true });
  };
  
  return {
    handleComplete,
    handlePrevious,
    handleNavigateToModule,
    currentModuleIdx: moduleIdxNumber
  };
};
