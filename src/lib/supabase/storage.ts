
import { supabase } from './client';

/**
 * Cria ou verifica a existência de um bucket de armazenamento público
 * com políticas adequadas para acesso e upload de arquivos
 * 
 * @param bucketName Nome do bucket a ser criado ou verificado
 * @returns Um objeto indicando sucesso ou falha com mensagem de erro
 */
export async function createStoragePublicPolicy(bucketName: string): Promise<{success: boolean, error: string | null}> {
  try {
    // Primeiro verificamos se o bucket existe
    const { data: bucket, error: bucketError } = await supabase
      .storage
      .getBucket(bucketName);
    
    // Se o bucket não existe, tentamos criá-lo
    if (!bucket || bucketError) {
      const { data, error } = await supabase
        .storage
        .createBucket(bucketName, {
          public: true,
          fileSizeLimit: 314572800, // 300MB em bytes
          allowedMimeTypes: [
            'image/png', 
            'image/jpeg', 
            'image/jpg', 
            'image/gif', 
            'image/svg+xml',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/csv',
            'video/mp4',
            'video/mpeg',
            'application/zip',
            'application/x-zip-compressed'
          ]
        });

      if (error) {
        console.error('Erro ao criar bucket:', error);
        return { success: false, error: `Erro ao criar bucket: ${error.message}` };
      }
    }
    
    // Definir políticas de acesso ao bucket (mesmo que já exista, atualizar políticas)
    const { data: updateData, error: updateError } = await supabase
      .storage
      .updateBucket(bucketName, {
        public: true,
        fileSizeLimit: 314572800, // 300MB
      });
    
    if (updateError) {
      console.error('Erro ao atualizar políticas do bucket:', updateError);
      return { success: false, error: `Erro ao atualizar políticas: ${updateError.message}` };
    }
    
    // Chamar RPC para definir as políticas públicas de acesso
    try {
      await supabase.rpc('create_storage_public_policy', { bucket_name: bucketName });
    } catch (rpcError: any) {
      console.warn('Aviso ao definir políticas via RPC:', rpcError);
      // Não retornamos erro aqui para não interromper o fluxo, já que algumas 
      // operações podem funcionar mesmo sem esta chamada
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Exceção ao configurar bucket de armazenamento:', error);
    return { success: false, error: `Exceção: ${error.message}` };
  }
}
