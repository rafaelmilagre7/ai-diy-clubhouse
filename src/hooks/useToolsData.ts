
import { useState, useEffect } from "react";
import { useLogging } from "@/hooks/useLogging";
import { supabase } from "@/lib/supabase";

export const useToolsData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { log, logError } = useLogging();
  
  // Verificar se o bucket para logos de ferramentas existe
  useEffect(() => {
    const checkToolLogosBucket = async () => {
      try {
        setIsLoading(true);
        log('Verificando bucket para logos de ferramentas...');
        
        // Listar buckets existentes
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          throw error;
        }
        
        // Verificar se o bucket tool_logos existe
        const toolLogosBucket = buckets?.find(bucket => bucket.name === 'tool_logos');
        
        if (!toolLogosBucket) {
          log('Bucket tool_logos não encontrado, criando...');
          
          // Criar o bucket se não existir
          const { error: createError } = await supabase.storage.createBucket('tool_logos', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          });
          
          if (createError) {
            throw createError;
          }
          
          log('Bucket tool_logos criado com sucesso');
        } else {
          log('Bucket tool_logos já existe');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao verificar bucket';
        logError('Erro ao verificar/criar bucket de logos:', errorMessage);
        setError(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setIsLoading(false);
      }
    };
    
    checkToolLogosBucket();
  }, [log, logError]);
  
  return { isLoading, error };
};
