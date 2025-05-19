import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/supabase/types";

/**
 * Busca os dados do perfil de um usuário no Supabase
 * @param userId ID do usuário
 * @returns Objeto com os dados do perfil
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) {
    console.error("ID de usuário não fornecido para busca de perfil");
    return null;
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, user_roles:role_id(id, name, description, permissions)')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Erro ao buscar perfil:", error);
      return null;
    }

    return profile as UserProfile;
  } catch (error) {
    console.error("Erro ao processar perfil:", error);
    return null;
  }
}

/**
 * Atualiza os dados do perfil de um usuário no Supabase
 * @param userId ID do usuário
 * @param updates Objeto com os dados a serem atualizados
 * @returns Booleano indicando sucesso ou falha
 */
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
  if (!userId) {
    console.error("ID de usuário não fornecido para atualização de perfil");
    return false;
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error("Erro ao atualizar perfil:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao processar atualização de perfil:", error);
    return false;
  }
}
