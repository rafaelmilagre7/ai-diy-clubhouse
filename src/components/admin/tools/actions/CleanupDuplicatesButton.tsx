
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Broom as BroomIcon } from "lucide-react";
import { fixToolsData } from "@/utils/toolDataFixer";

interface CleanupDuplicatesButtonProps {
  onCleanupComplete?: () => void;
}

export const CleanupDuplicatesButton = ({ onCleanupComplete }: CleanupDuplicatesButtonProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const handleCleanupClick = async () => {
    try {
      setIsRunning(true);
      console.log("Iniciando limpeza de ferramentas duplicadas");

      const result = await fixToolsData();

      if (result) {
        toast({
          title: "Limpeza concluída",
          description: "Ferramentas duplicadas foram removidas com sucesso",
        });
      } else {
        toast({
          title: "Limpeza concluída com avisos",
          description: "Verifique o console para mais detalhes",
          variant: "destructive",
        });
      }

      // Notificar o componente pai (se necessário)
      if (onCleanupComplete) {
        onCleanupComplete();
      }
    } catch (error) {
      console.error("Erro ao limpar ferramentas duplicadas:", error);
      toast({
        title: "Erro na limpeza",
        description: "Não foi possível completar a limpeza de duplicatas",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCleanupClick}
      disabled={isRunning}
    >
      {isRunning ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Limpando...
        </>
      ) : (
        <>
          <BroomIcon className="mr-2 h-4 w-4" />
          Remover Duplicatas
        </>
      )}
    </Button>
  );
};
