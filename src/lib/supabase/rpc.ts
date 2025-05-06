
import { supabase } from "./client";

/**
 * Cria políticas de acesso público para um bucket
 * @param bucketName Nome do bucket
 * @returns Objeto com status da operação
 */
export async function createStoragePublicPolicy(bucketName: string): Promise<{ success: boolean, error?: string }> {
  try {
    const { data, error } = await supabase.rpc('create_storage_public_policy', {
      bucket_name: bucketName
    });
    
    if (error) {
      console.error(`Erro ao criar políticas para ${bucketName}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error(`Erro ao criar políticas para ${bucketName}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Valida o papel do usuário com base no email
 */
export async function validateUserRole(profileId: string, currentRole: string, email: string): Promise<{ 
  success: boolean;
  role?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.rpc('validateuserrole', {
      profileid: profileId,
      currentrole: currentRole,
      email: email
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, role: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
