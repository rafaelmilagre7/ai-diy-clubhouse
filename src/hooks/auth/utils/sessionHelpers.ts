
import { supabase, UserProfile } from "@/lib/supabase";
import { processUserProfile } from "@/contexts/auth/utils/profileOperations";
import { determineRoleFromEmail, validateUserRole } from "@/contexts/auth/utils/roleValidation";

/**
 * Processa o perfil do usuário durante a inicialização da sessão
 * Busca o perfil existente ou cria um novo se necessário
 */
export const processUserProfileSession = async (
  userId: string,
  email: string | undefined | null,
  name: string | undefined | null
): Promise<UserProfile | null> => {
  return await processUserProfile(userId, email, name);
};

/**
 * Inicializa um novo perfil com valores padrão
 */
export const initializeNewProfile = async (userId: string, email: string, name: string): Promise<UserProfile | null> => {
  try {
    const role = determineRoleFromEmail(email);
    
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email,
        name,
        role,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao inicializar novo perfil:", error);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error("Erro inesperado ao inicializar perfil:", error);
    return null;
  }
};
