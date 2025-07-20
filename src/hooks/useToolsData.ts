
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";
import { STORAGE_BUCKETS } from "@/lib/supabase/config";

export const useToolsData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { log, logError } = useLogging();

  useEffect(() => {
    const fetchToolsData = async () => {
      try {
        setIsLoading(true);
        await checkToolLogosBucket();
      } catch (error) {
        // Capturar o erro, mas não bloquear a renderização
        console.error("Erro ao inicializar dados de ferramentas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToolsData();
  }, []);

  // Função para verificar e criar o bucket de logos se necessário
  const checkToolLogosBucket = async () => {
    try {
      log("Verificando bucket para logos de ferramentas...", {});
      
      // Consultar informações sobre o bucket sem tentar criá-lo
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();
      
      if (bucketsError) {
        // Apenas registrar o erro e continuar
        logError("Erro ao listar buckets", bucketsError);
        return;
      }
      
      const bucketExists = buckets?.find(bucket => bucket.name === STORAGE_BUCKETS.TOOL_LOGOS);
      
      if (!bucketExists) {
        log(`Bucket ${STORAGE_BUCKETS.TOOL_LOGOS} não encontrado, mas será criado pelo administrador`, {});
        // Não tentamos criar o bucket aqui para evitar erros de RLS
      }
    } catch (err) {
      // Capturar o erro, mas não bloquear a funcionalidade principal
      logError("Erro ao verificar bucket de logos", err);
    }
  };

  return { isLoading, error };
};
