
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";

export const useImplementationNavigation = () => {
  const { id, moduleIndex, moduleIdx } = useParams<{ 
    id: string; 
    moduleIndex: string;
    moduleIdx: string;
  }>();
  
  const { log, logError } = useLogging("useImplementationNavigation");
  
  // Normaliza os parâmetros, suportando tanto /implement/:id/:moduleIdx quanto /implementation/:id/:moduleIdx
  const moduleIdxParam = moduleIndex || moduleIdx || "0";
  const moduleIdxNumber = parseInt(moduleIdxParam);
  const navigate = useNavigate();
  
  // Usa consistentemente o padrão /implement/:id/:moduleIdx para navegação
  const basePath = "/implement";
  
  // Verificar se temos um ID válido
  useEffect(() => {
    if (!id) {
      logError("ID da implementação não encontrado");
      toast.error("Não foi possível carregar a implementação");
      navigate("/dashboard");
    }
  }, [id, navigate, logError]);

  // Se houver um erro de navegação, tenta corrigir
  useEffect(() => {
    const path = window.location.pathname;
    if ((path.includes("/implementation/") || path.includes("/implement/")) && 
        !path.includes(`/${moduleIdxNumber}`)) {
      // URL incorreta, vamos corrigir
      const correctPath = `${basePath}/${id}/${moduleIdxNumber}`;
      log("Corrigindo URL de implementação", { from: path, to: correctPath });
      navigate(correctPath, { replace: true });
    }
  }, [id, moduleIdxNumber, navigate, log]);
  
  // Navigate to next module
  const handleComplete = () => {
    console.log(`Navegando para o próximo módulo: ${moduleIdxNumber + 1}`);
    navigate(`${basePath}/${id}/${moduleIdxNumber + 1}`, { replace: true });
  };
  
  // Navigate to previous module
  const handlePrevious = () => {
    if (moduleIdxNumber > 0) {
      console.log(`Navegando para o módulo anterior: ${moduleIdxNumber - 1}`);
      navigate(`${basePath}/${id}/${moduleIdxNumber - 1}`, { replace: true });
    } else {
      console.log(`Voltando para a página de solução: ${id}`);
      navigate(`/solutions/${id}`, { replace: true });
    }
  };
  
  // Navigate to specific module
  const handleNavigateToModule = (moduleIdx: number) => {
    console.log(`Navegando para o módulo específico: ${moduleIdx}`);
    navigate(`${basePath}/${id}/${moduleIdx}`, { replace: true });
  };
  
  return {
    handleComplete,
    handlePrevious,
    handleNavigateToModule,
    currentModuleIdx: moduleIdxNumber
  };
};
