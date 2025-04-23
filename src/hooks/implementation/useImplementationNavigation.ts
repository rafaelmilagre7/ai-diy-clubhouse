
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useLogging } from "@/hooks/useLogging";

export const useImplementationNavigation = () => {
  const { id, moduleIdx } = useParams<{ 
    id: string; 
    moduleIdx: string; 
  }>();
  
  const moduleIdxNumber = parseInt(moduleIdx || "0");
  
  const { log } = useLogging("useImplementationNavigation");
  const navigate = useNavigate();
  const navigationAttempts = useRef(0);
  
  // Padronizamos para usar apenas o formato /implement/:id/:moduleIdx
  const basePath = "/implement";
  
  // Verificar se temos um ID válido
  useEffect(() => {
    if (!id) {
      log("ID da implementação não encontrado, redirecionando para dashboard");
      navigate("/dashboard", { replace: true });
      return;
    }
  }, [id, navigate, log]);

  // Navigate to next module
  const handleComplete = () => {
    if (!id) {
      log("ID da implementação não encontrado, não é possível avançar");
      return;
    }
    navigate(`${basePath}/${id}/${moduleIdxNumber + 1}`, { replace: true });
  };
  
  // Navigate to previous module
  const handlePrevious = () => {
    if (!id) {
      log("ID da implementação não encontrado, não é possível retornar");
      return;
    }
    
    if (moduleIdxNumber > 0) {
      navigate(`${basePath}/${id}/${moduleIdxNumber - 1}`, { replace: true });
    } else {
      navigate(`/solutions/${id}`, { replace: true });
    }
  };
  
  // Navigate to specific module
  const handleNavigateToModule = (moduleIdx: number) => {
    if (!id) {
      log("ID da implementação não encontrado, não é possível navegar para módulo específico");
      return;
    }
    navigate(`${basePath}/${id}/${moduleIdx}`, { replace: true });
  };
  
  return {
    handleComplete,
    handlePrevious,
    handleNavigateToModule,
    currentModuleIdx: moduleIdxNumber,
    implementationId: id
  };
};
