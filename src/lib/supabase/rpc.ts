
import { supabase } from "./client";

/**
 * Cria políticas de acesso público para um bucket de armazenamento
 */
export const createStoragePublicPolicy = async (bucketName: string) => {
  try {
    console.log(`Criando políticas públicas para o bucket: ${bucketName}`);
    
    const { data, error } = await supabase.rpc('create_storage_public_policy', {
      bucket_name: bucketName
    });
    
    if (error) {
      console.error(`Erro ao criar políticas para ${bucketName}:`, error);
      throw error;
    }
    
    console.log(`Políticas públicas criadas com sucesso para ${bucketName}:`, data);
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`Falha ao criar políticas para ${bucketName}:`, error);
    return { success: false, error: error.message };
  }
};
