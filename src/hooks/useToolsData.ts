
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";
import { STORAGE_BUCKETS } from "@/lib/supabase/config";

export const useToolsData = () => {
  const { log, logError } = useLogging();

  // Verificação assíncrona não-bloqueante do bucket
  useEffect(() => {
    const checkBucketAsync = async () => {
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.find(bucket => bucket.name === STORAGE_BUCKETS.TOOL_LOGOS);
        
        if (!bucketExists && import.meta.env.DEV) {
          console.warn(`Bucket ${STORAGE_BUCKETS.TOOL_LOGOS} não encontrado`);
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("Erro ao verificar bucket de logos:", err);
        }
      }
    };

    checkBucketAsync();
  }, []);

  return { isLoading: false, error: null };
};
