
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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
        console.log("[AulaStorage] Verificando buckets essenciais...");
        
        // Verificar se o bucket lesson_images existe
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error("[AulaStorage] Erro ao listar buckets:", error);
          setStorageError(`Erro ao verificar buckets: ${error.message}`);
          setStorageReady(false);
          return;
        }
        
        const lessonImagesBucket = buckets?.find(bucket => bucket.name === 'lesson_images');
        
        if (!lessonImagesBucket) {
          console.warn("[AulaStorage] Bucket lesson_images não encontrado");
          setStorageError("Bucket lesson_images não configurado. Execute a migration SQL primeiro.");
          setStorageReady(false);
          return;
        }
        
        console.log("[AulaStorage] Bucket lesson_images encontrado e configurado");
        setStorageReady(true);
        setStorageError(null);
        
      } catch (error: any) {
        console.error("[AulaStorage] Erro ao verificar armazenamento:", error);
        setStorageError("Erro ao verificar armazenamento");
        setStorageReady(false);
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
      
      console.log("[AulaStorage] Tentando reconfigurar buckets...");
      
      // Verificar novamente os buckets
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        setStorageError(`Erro ao verificar buckets: ${error.message}`);
        toast.error(`Erro: ${error.message}`);
        return;
      }
      
      const lessonImagesBucket = buckets?.find(bucket => bucket.name === 'lesson_images');
      
      if (lessonImagesBucket) {
        setStorageReady(true);
        setStorageError(null);
        toast.success("Configuração de armazenamento verificada com sucesso!");
      } else {
        setStorageError("Bucket lesson_images ainda não existe. Execute a migration SQL.");
        toast.error("Execute a migration SQL para criar os buckets necessários.");
      }
    } catch (error: any) {
      setStorageError(error.message || "Erro desconhecido");
      toast.error("Erro ao verificar armazenamento");
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
