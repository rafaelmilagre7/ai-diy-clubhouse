
import { supabase } from "./index";

/**
 * Cria políticas públicas de acesso para um bucket específico
 * @param bucketName Nome do bucket para aplicar a política
 * @returns Um objeto indicando o status da operação
 */
export async function createStoragePublicPolicy(bucketName: string) {
  try {
    const { data, error } = await supabase.rpc('create_storage_public_policy', {
      bucket_name: bucketName
    });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao criar política pública para bucket:", error);
    return { success: false, error };
  }
}
