
import { supabase } from './client';

/**
 * Cria uma política pública para um bucket de armazenamento,
 * permitindo acesso de leitura público e acesso de escrita para usuários autenticados
 * @param bucketName Nome do bucket de armazenamento
 * @returns Promise com resultado da operação
 */
export async function createStoragePublicPolicy(bucketName: string): Promise<{ success: boolean, error?: any }> {
  try {
    // Verifica se o bucket existe
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    // Se o bucket não existir, tenta criar
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 314572800 // 300 MB
      });
      
      if (createError) {
        console.error(`Erro ao criar bucket ${bucketName}:`, createError);
        return { success: false, error: createError };
      }
    }
    
    // Chama a função RPC do Supabase para configurar as políticas
    const { data, error } = await supabase.rpc('create_storage_public_policy', {
      bucket_name: bucketName
    });
    
    if (error) {
      console.error(`Erro ao configurar políticas para ${bucketName}:`, error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Erro inesperado ao configurar bucket ${bucketName}:`, error);
    return { success: false, error };
  }
}
