
import { supabase } from '@/lib/supabase';
import { determineRoleFromEmail, validateRole } from './roleValidation';
import { UserProfile, UserRole } from '@/lib/supabase/types';

interface ProfileData {
  name: string;
  email: string;
  role?: string;
  avatar_url?: string;
  whatsapp_number?: string;
}

/**
 * Busca o perfil do usuário no banco de dados
 * 
 * @param userId ID do usuário para buscar o perfil
 * @returns UserProfile ou null se não encontrar
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles:role_id (
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
  } catch (err) {
    console.error('Exceção ao buscar perfil:', err);
    return null;
  }
}

/**
 * Cria um perfil de usuário no banco de dados
 * 
 * @param userId ID do usuário para criar o perfil
 * @param profileData Dados para criar o perfil
 * @returns Perfil criado ou null se falhar
 */
export async function createUserProfile(
  userId: string, 
  profileData: ProfileData
): Promise<UserProfile | null> {
  if (!userId) return null;

  try {
    // Determinar role baseado no email para usuários novos
    const role = validateRole(profileData.role || determineRoleFromEmail(profileData.email));
    
    // Buscar o role_id baseado no nome do role
    let roleId: string | null = null;
    
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', role)
      .single();
      
    if (!roleError && roleData) {
      roleId = roleData.id;
    }

    // Dados para inserir
    const newProfile = {
      id: userId,
      name: profileData.name,
      email: profileData.email,
      avatar_url: profileData.avatar_url || null,
      role: role,
      role_id: roleId,
      whatsapp_number: profileData.whatsapp_number || null
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select(`
        *,
        user_roles:role_id (
          id, 
          name,
          description
        )
      `)
      .single();

    if (error) {
      console.error('Erro ao criar perfil:', error);
      return null;
    }

    return data as UserProfile;
  } catch (err) {
    console.error('Exceção ao criar perfil:', err);
    return null;
  }
}
