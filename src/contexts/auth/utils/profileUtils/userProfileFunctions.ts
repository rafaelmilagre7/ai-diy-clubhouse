
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles:user_roles(
          id,
          name,
          description
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Erro na busca do perfil:', error);
    return null;
  }
};

export const createUserProfileIfNeeded = async (userId: string, userData?: any): Promise<UserProfile | null> => {
  try {
    // Verificar se o perfil já existe
    const existingProfile = await fetchUserProfile(userId);
    if (existingProfile) {
      return existingProfile;
    }

    // Criar novo perfil sem propriedades inexistentes
    const profileData = {
      id: userId,
      email: userData?.email || '',
      name: userData?.name || '',
      // Removido whatsapp_number - não existe no tipo UserProfile
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar perfil:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    return null;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  return await fetchUserProfile(userId);
};

export const createUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar perfil:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
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

export const deleteUserProfile = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Erro ao deletar perfil:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao deletar perfil:', error);
    return false;
  }
};

// Função auxiliar para lidar com roles
export const assignRoleToUser = async (userId: string, roleName: string): Promise<boolean> => {
  try {
    // Buscar o role_id baseado no nome
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', roleName)
      .single();

    if (roleError || !roleData) {
      console.error('Role não encontrado:', roleName);
      return false;
    }

    // Atualizar o perfil com o novo role_id
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role_id: roleData.id })
      .eq('id', userId);

    if (updateError) {
      console.error('Erro ao atualizar role do usuário:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atribuir role:', error);
    return false;
  }
};
