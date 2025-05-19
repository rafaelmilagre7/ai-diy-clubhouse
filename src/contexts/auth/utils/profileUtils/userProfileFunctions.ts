
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/lib/supabase/types";

/**
 * Busca o perfil do usuário do Supabase
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles:role_id (id, name, description, permissions)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil de usuário:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Erro ao buscar perfil de usuário:', error);
    return null;
  }
};

/**
 * Atualiza o perfil do usuário no Supabase
 */
export const updateUserProfile = async (
  userId: string, 
  profileData: Partial<UserProfile>
): Promise<UserProfile | null> => {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return null;
  }
};
