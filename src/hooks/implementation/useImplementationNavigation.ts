
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";

export const useImplementationNavigation = () => {
  const { id, moduleIndex, moduleIdx } = useParams<{ 
    id: string; 
    moduleIndex: string;
    moduleIdx: string;
  }>();
  
  const { log } = useLogging("useImplementationNavigation");
  const navigationAttempts = useRef(0);
  
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
      toast.error("ID da solução não encontrado");
      navigate("/dashboard", { replace: true });
    }
  }, [id, navigate, log]);

  // Corrigir problemas de URL inconsistente - com limitador de tentativas
  useEffect(() => {
    // Limitar correções para evitar loops
    if (navigationAttempts.current > 2 || !id) return;
    
    const path = window.location.pathname;
    
    // Só fazer correção se precisar
    if (path.includes("/implementation/") || 
        (path.includes("/implement/") && !path.includes(`/${moduleIdxNumber}`))) {
      
      navigationAttempts.current += 1;
      
      // URL incorreta, vamos corrigir de forma silenciosa
      const correctPath = `${basePath}/${id}/${moduleIdxNumber}`;
      log("Corrigindo URL de implementação", { from: path, to: correctPath });
      navigate(correctPath, { replace: true });
    }
  }, [id, moduleIdxNumber, navigate, log]);
  
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
