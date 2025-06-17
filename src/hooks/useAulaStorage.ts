
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
        console.log("[Storage] Verificando buckets essenciais...");
        
        // Verificar se o bucket lesson_images existe
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error("[Storage] Erro ao listar buckets:", error);
          setStorageError(`Erro ao verificar buckets: ${error.message}`);
          setStorageReady(false);
          return;
        }
        
        const lessonImagesBucket = buckets?.find(bucket => bucket.name === 'lesson_images');
        
        if (!lessonImagesBucket) {
          console.warn("[Storage] Bucket lesson_images não encontrado");
          setStorageError("Bucket lesson_images não configurado");
          setStorageReady(false);
          return;
        }
        
        console.log("[Storage] Bucket lesson_images encontrado e configurado");
        setStorageReady(true);
        setStorageError(null);
        
      } catch (error: any) {
        console.error("[Storage] Erro ao verificar armazenamento:", error);
        setStorageError("Erro ao verificar armazenamento");
        setStorageReady(false);
        toast.error("Erro ao verificar armazenamento. Alguns recursos podem não funcionar.");
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
      
      // Tentar usar a função RPC para criar buckets se disponível
      console.log("[Storage] Tentando configurar buckets via RPC...");
      
      const { data, error } = await supabase.rpc('setup_learning_storage_buckets');
      
      if (error) {
        console.warn("[Storage] RPC não disponível, verificando buckets manualmente:", error);
        
        // Fallback: verificar buckets diretamente
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
          setStorageError(`Erro ao verificar buckets: ${listError.message}`);
          toast.error(`Erro: ${listError.message}`);
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
      } else {
        console.log("[Storage] Configuração via RPC concluída:", data);
        setStorageReady(true);
        setStorageError(null);
        toast.success("Configuração de armazenamento concluída com sucesso!");
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
