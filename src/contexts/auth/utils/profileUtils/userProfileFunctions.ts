
import { supabase } from "@/lib/supabase";
import { determineRoleFromEmail } from './roleValidation';
import { UserRole } from "@/lib/supabase/types";

/**
 * Interface para dados de perfil de usuário
 */
export interface UserProfileData {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  role?: string;
  role_id?: string;
}

/**
 * Busca o perfil de um usuário pelo ID
 * 
 * @param userId ID do usuário
 * @returns Dados do perfil do usuário, ou null se não encontrado
 */
export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error("Erro ao buscar perfil:", error);
      return null;
    }

    return data as UserProfileData;
  } catch (error) {
    console.error("Erro ao processar perfil:", error);
    return null;
  }
}

/**
 * Atualiza o perfil de um usuário
 * 
 * @param userId ID do usuário
 * @param profileData Dados a serem atualizados
 * @returns true se a atualização foi bem-sucedida, false caso contrário
 */
export async function updateUserProfile(
  userId: string, 
  profileData: Partial<UserProfileData>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
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

/**
 * Cria um perfil de usuário
 * 
 * @param userData Dados do usuário para criar perfil
 * @returns O ID do perfil criado ou null se houver falha
 */
export async function createUserProfile(userData: {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}): Promise<string | null> {
  try {
    // Determinar papel com base no email
    const role = determineRoleFromEmail(userData.email);
    
    // Obter ID do papel baseado no nome do papel
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', role)
      .single();
      
    const roleId = roleData?.id;
    
    // Criar perfil
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userData.id,
        email: userData.email,
        name: userData.name || 'Usuário',
        avatar_url: userData.avatar_url,
        role: role,
        role_id: roleId
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar perfil:", error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error("Erro ao processar criação de perfil:", error);
    return null;
  }
}
