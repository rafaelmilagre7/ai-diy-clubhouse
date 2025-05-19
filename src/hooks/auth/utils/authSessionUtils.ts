
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { fetchUserProfile } from "@/contexts/auth/utils/profileUtils/userProfileFunctions";
import type { UserProfile } from "@/lib/supabase/types";

/**
 * Processa os dados da sessão e do usuário para obter informações completas do perfil
 * @param session Sessão atual do Supabase
 * @returns Objeto com os dados processados da sessão, usuário e perfil
 */
export async function processUserProfile(user: User): Promise<UserProfile | null> {
  if (!user) {
    return null;
  }

  try {
    // Buscar o perfil completo do usuário
    const profile = await fetchUserProfile(user.id);
    
    // Se não encontrou o perfil, retornar um perfil básico com os dados do usuário
    if (!profile) {
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || 'Usuário',
        created_at: user.created_at,
        avatar_url: user.user_metadata?.avatar_url,
        role: 'member'
      };
    }
    
    return profile;
  } catch (error) {
    console.error("Erro ao processar perfil do usuário:", error);
    return null;
  }
}

/**
 * Verifica o status atual da sessão para autenticação
 * @returns Objeto com dados da sessão atual
 */
export async function checkCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    return session;
  } catch (error) {
    console.error("Erro ao verificar sessão atual:", error);
    return null;
  }
}
