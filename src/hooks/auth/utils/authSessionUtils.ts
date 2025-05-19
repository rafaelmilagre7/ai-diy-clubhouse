
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/lib/supabase/types";

/**
 * Processa o perfil do usuário após login ou alteração de sessão
 */
export const processUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId) return null;
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles:role_id (id, name, description, permissions)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }

    return profile as UserProfile;
  } catch (error) {
    console.error('Erro ao processar perfil de usuário:', error);
    return null;
  }
};
