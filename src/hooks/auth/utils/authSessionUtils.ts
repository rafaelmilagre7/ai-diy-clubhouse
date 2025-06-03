
import { supabase, UserProfile } from "@/lib/supabase";

/**
 * Busca o perfil do usuário pelo ID
 */
const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
};

/**
 * Cria um novo perfil se necessário
 */
const createUserProfileIfNeeded = async (userId: string, email: string, name: string): Promise<UserProfile | null> => {
  try {
    // Determinar role baseado no email
    const role = email.includes('@admin.') ? 'admin' : 'member';
    
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
      console.error("Erro ao criar perfil:", error);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error("Erro inesperado ao criar perfil:", error);
    return null;
  }
};

/**
 * Processa o perfil do usuário durante a inicialização da sessão
 */
export const processUserProfile = async (
  userId: string,
  email: string | undefined | null,
  name: string | undefined | null
): Promise<UserProfile | null> => {
  try {
    if (!userId) {
      console.error("ID de usuário não fornecido");
      return null;
    }
    
    // Tentar buscar perfil existente
    let profile = await fetchUserProfile(userId);
    
    // Se não encontrou, criar novo
    if (!profile && email) {
      console.log("Criando novo perfil para", email);
      profile = await createUserProfileIfNeeded(userId, email, name || "Usuário");
    }
    
    return profile;
  } catch (error) {
    console.error("Erro ao processar perfil:", error);
    return null;
  }
};
