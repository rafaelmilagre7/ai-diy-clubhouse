
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/lib/supabase";

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log(`[PROFILE] Buscando perfil para usuário: ${userId}`);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles (
          id,
          name,
          description,
          permissions
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn(`[PROFILE] Perfil não encontrado para usuário: ${userId}`);
        return null;
      }
      console.error('Error fetching user profile:', error);
      return null;
    }

    console.log(`[PROFILE] Perfil carregado com sucesso para: ${userId}`);
    return profile as UserProfile;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};

export const createUserProfileIfNeeded = async (
  userId: string,
  email?: string,
  name?: string
): Promise<UserProfile | null> => {
  try {
    console.log(`[PROFILE] Verificando se precisa criar perfil para: ${userId}`);
    
    // Primeiro verificar se já existe
    const existingProfile = await fetchUserProfile(userId);
    if (existingProfile) {
      console.log(`[PROFILE] Perfil já existe para: ${userId}`);
      return existingProfile;
    }

    console.log(`[PROFILE] Criando perfil para usuário: ${userId}`);
    
    // Usar a função segura do banco
    const { data, error } = await supabase.rpc('create_missing_profile_safe', {
      target_user_id: userId
    });

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }

    if (data?.success) {
      console.log(`[PROFILE] Perfil criado com sucesso para: ${userId}`);
      // Buscar o perfil recém-criado
      return await fetchUserProfile(userId);
    }

    console.warn(`[PROFILE] Falha na criação do perfil: ${data?.message || 'Erro desconhecido'}`);
    return null;
  } catch (error) {
    console.error('Error in createUserProfileIfNeeded:', error);
    return null;
  }
};
