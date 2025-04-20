
import { useState, useEffect } from "react";
import { fixToolsData } from "@/utils/toolDataFixer";
import { useLogging } from "@/hooks/useLogging";

export const useToolsData = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { log, logError } = useLogging();

  useEffect(() => {
    const runFixer = async () => {
      try {
        setIsFixing(true);
        log("Iniciando verificação/correção dos dados das ferramentas");
        
        const result = await fixToolsData();
        
        if (result) {
          log("Correção dos dados das ferramentas concluída com sucesso");
          setIsFixed(true);
        } else {
          log("Correção dos dados das ferramentas concluída com avisos");
          setIsFixed(true);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Erro desconhecido");
        logError("Erro ao corrigir dados das ferramentas:", error);
        setError(error);
      } finally {
        setIsFixing(false);
      }
    };

    runFixer();
  }, [log, logError]);

  return { isFixing, isFixed, error };
};
