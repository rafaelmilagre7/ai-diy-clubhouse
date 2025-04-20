
import { useState, useEffect } from "react";
import { fixToolsData } from "@/utils/toolDataFixer";

export const useToolsData = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const runFixer = async () => {
      try {
        setIsFixing(true);
        console.log("Iniciando verificação/correção dos dados das ferramentas");
        
        const result = await fixToolsData();
        
        if (result) {
          console.log("Correção dos dados das ferramentas concluída com sucesso");
          setIsFixed(true);
        } else {
          console.log("Correção dos dados das ferramentas concluída com avisos");
          setIsFixed(true);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Erro desconhecido");
        console.error("Erro ao corrigir dados das ferramentas:", error);
        setError(error);
      } finally {
        setIsFixing(false);
      }
    };

    runFixer();
  }, []);

  return { isFixing, isFixed, error };
};
