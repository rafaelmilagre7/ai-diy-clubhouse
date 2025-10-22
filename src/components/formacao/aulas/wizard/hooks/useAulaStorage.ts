
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { setupLearningStorageBuckets } from "@/lib/supabase/storage";

export interface StorageStatus {
  checked: boolean;
  exists: boolean;
  error?: string;
}

export const useAulaStorage = () => {
  const [storageReady, setStorageReady] = useState(false);
  const [storageChecking, setStorageChecking] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Verificar configuração de storage ao inicializar
  useEffect(() => {
    const checkStorageConfig = async () => {
      try {
        setStorageChecking(true);
        const result = await setupLearningStorageBuckets();
        setStorageReady(result.success);
        
        if (!result.success) {
          setStorageError(result.error);
          toast.warning("Configuração de armazenamento incompleta. Alguns recursos podem não funcionar corretamente.");
        } else {
          setStorageError(null);
        }
      } catch (error) {
        console.error("Erro ao verificar configuração de armazenamento:", error);
        setStorageError("Erro ao verificar armazenamento");
        toast.error("Erro ao verificar armazenamento. Alguns recursos podem não funcionar corretamente.");
      } finally {
        setStorageChecking(false);
      }
    };
    
    checkStorageConfig();
  }, []);

  const retryStorageSetup = async () => {
    try {
      setStorageChecking(true);
      setStorageError(null);
      
      const result = await setupLearningStorageBuckets();
      setStorageReady(result.success);
      
      if (result.success) {
        toast.success("Configuração de armazenamento concluída com sucesso!");
      } else {
        setStorageError(result.error);
        toast.error(`Falha na configuração: ${result.error}`);
      }
    } catch (error: any) {
      setStorageError(error.message || "Erro desconhecido");
      toast.error("Erro ao configurar armazenamento");
    } finally {
      setStorageChecking(false);
    }
  };

  return {
    storageReady,
    storageChecking,
    storageError,
    retryStorageSetup
  };
};
