
import { useState } from "react";
import { useLogging } from "@/hooks/useLogging";

// Este hook foi simplificado após a remoção da funcionalidade de limpeza de duplicatas
export const useToolsData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { log, logError } = useLogging();

  // Hook mantido para compatibilidade com componentes existentes
  // mas com funcionalidade de limpeza removida
  
  return { isLoading, error };
};
