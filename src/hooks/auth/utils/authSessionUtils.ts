
import { supabase, UserProfile } from "@/lib/supabase";
import { createUserProfileIfNeeded, fetchUserProfile } from "@/contexts/auth/utils/profileUtils";
import { validateUserRole } from "@/contexts/auth/utils/profileUtils/roleValidation";

/**
 * Processa o perfil do usuário durante a inicialização da sessão
 * Busca o perfil existente ou cria um novo se necessário
 */
export const processUserProfile = async (
  userId: string,
  email: string | undefined | null,
  name: string | undefined | null
): Promise<UserProfile | null> => {
  try {
    if (!userId) {
      console.error("ID de usuário não fornecido para processamento de perfil");
      return null;
    }
    
    // Tentar buscar perfil existente
    let profile = await fetchUserProfile(userId);
    
    // Se não encontrou perfil, criar um novo
    if (!profile) {
      console.log("Nenhum perfil encontrado, criando novo perfil para", email);
      profile = await createUserProfileIfNeeded(userId, email || "", name || "Usuário");
      
      if (!profile) {
        console.error("Falha ao criar perfil para", email);
        return null;
      }
    }
    
    // Verificar e atualizar o papel do usuário se necessário
    if (profile.role) {
      const validatedRole = await validateUserRole(profile.id);
      if (validatedRole !== profile.role) {
        profile.role = validatedRole as any;
      }
    }
    
    return profile;
  } catch (error) {
    console.error("Erro ao processar perfil do usuário:", error);
    return null;
  }
};

/**
 * Inicializa um novo perfil com valores padrão
 */
export const initializeNewProfile = async (userId: string, email: string, name: string): Promise<UserProfile | null> => {
  try {
    const role = 'membro_club'; // Default role for production
    
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
