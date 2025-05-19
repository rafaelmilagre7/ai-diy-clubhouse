
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/lib/supabase/types";

/**
 * Atualiza o perfil do usuário no banco de dados
 */
export const updateUserProfile = async (
  userId: string, 
  profileData: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Erro ao atualizar perfil'
    };
  }
};
