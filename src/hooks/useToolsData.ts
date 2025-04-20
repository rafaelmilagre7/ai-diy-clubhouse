
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
        log("Iniciando verificação de ferramentas duplicadas");
        
        const result = await fixToolsData();
        
        if (result) {
          log("Limpeza de ferramentas duplicadas concluída com sucesso");
          setIsFixed(true);
        } else {
          log("Limpeza de ferramentas duplicadas concluída com avisos");
          setIsFixed(true);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Erro desconhecido");
        logError("Erro ao limpar ferramentas duplicadas:", error);
        setError(error);
      } finally {
        setIsFixing(false);
      }
    };

    runFixer();
  }, [log, logError]);

  return { isFixing, isFixed, error };
};
