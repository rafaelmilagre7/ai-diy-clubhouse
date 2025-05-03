
import { supabase } from "./client";

/**
 * Verifica se um bucket de armazenamento existe e, se não, cria o bucket com políticas públicas
 * @param bucketName Nome do bucket a ser verificado/criado
 * @returns Objeto com status de sucesso e mensagem de erro, se houver
 */
export async function createStoragePublicPolicy(bucketName: string): Promise<{ success: boolean, error?: string }> {
  try {
    // Verificar se o bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error(`[Storage] Erro ao listar buckets: ${listError.message}`);
      return { success: false, error: listError.message };
    }
    
    // Verificar se o bucket já existe
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`[Storage] Bucket ${bucketName} já existe`);
      return { success: true };
    }
    
    // Se não existir, criar o bucket
    console.log(`[Storage] Criando bucket ${bucketName}...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 104857600, // 100MB limit
      allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    });
    
    if (createError) {
      console.error(`[Storage] Erro ao criar bucket ${bucketName}: ${createError.message}`);
      return { success: false, error: createError.message };
    }
    
    // Chamar função RPC para criar políticas (se necessário)
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_storage_public_policy', {
      bucket_name: bucketName
    });
    
    if (rpcError) {
      console.error(`[Storage] Erro ao criar políticas para o bucket: ${rpcError.message}`);
      return { success: false, error: rpcError.message };
    }
    
    console.log(`[Storage] Bucket ${bucketName} criado com sucesso`);
    return { success: true };
  } catch (error: any) {
    console.error('[Storage] Erro ao verificar/criar bucket:', error);
    return { success: false, error: error.message };
  }
}
