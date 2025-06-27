
import { supabase } from '@/lib/supabase';

export const ensureStorageBucket = async (bucketName: string): Promise<boolean> => {
  try {
    // Verificar se o bucket existe primeiro
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      // Criar bucket se não existir
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 314572800 // 300MB
      });
      
      if (createError) {
        console.warn(`Erro ao criar bucket ${bucketName}:`, createError);
      }
    }
    
    // Tentar usar RPC com cast para any para contornar tipo
    try {
      const { data, error } = await (supabase as any).rpc('create_storage_public_policy', {
        bucket_name: bucketName
      });
      
      if (error) {
        console.warn(`Erro ao criar políticas para ${bucketName}:`, error);
        return false;
      }
      
      return Boolean(data);
    } catch (rpcError) {
      console.warn(`RPC não disponível, mas bucket ${bucketName} pode estar configurado:`, rpcError);
      return true; // Assumir sucesso se RPC não estiver disponível
    }
  } catch (error) {
    console.error(`Erro ao configurar bucket ${bucketName}:`, error);
    return false;
  }
};

export const uploadFileToStorage = async (
  file: File,
  bucketName: string,
  filePath: string
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    // Garantir que o bucket existe
    const bucketReady = await ensureStorageBucket(bucketName);
    if (!bucketReady) {
      console.warn(`Bucket ${bucketName} pode não estar completamente configurado`);
    }
    
    // Upload do arquivo
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erro no upload:', error);
      return { url: null, error };
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Erro inesperado no upload:', error);
    return { 
      url: null, 
      error: error instanceof Error ? error : new Error('Erro inesperado no upload') 
    };
  }
};

// Função auxiliar para verificar se arquivo é válido
export const validateFile = (
  file: File,
  maxSizeBytes: number = 314572800,
  allowedTypes: string[] = ['image/*', 'video/*', 'application/pdf']
): { valid: boolean; error?: string } => {
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo: ${Math.round(maxSizeBytes / 1024 / 1024)}MB`
    };
  }

  const isValidType = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.replace('/*', '/'));
    }
    return file.type === type;
  });

  if (!isValidType) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Permitidos: ${allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
};
