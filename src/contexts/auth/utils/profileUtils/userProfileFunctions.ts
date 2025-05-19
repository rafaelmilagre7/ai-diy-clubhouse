
import { supabase } from "@/lib/supabase";
import { generateTempId } from "@/utils/stringGenerator";
import type { UserProfile } from "@/lib/supabase/types";

/**
 * Busca o perfil do usuário
 * @param userId ID do usuário
 * @returns Perfil do usuário
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, user_roles:role_id(id, name, description, permissions)')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    return null;
  }
}

/**
 * Cria um perfil de usuário caso não exista
 * @param userId ID do usuário
 * @param userData Dados do usuário
 * @returns Perfil criado ou existente
 */
export async function createUserProfile(
  userId: string, 
  userData: { email?: string; name?: string; avatar_url?: string; role?: string }
): Promise<UserProfile | null> {
  if (!userId) return null;
  
  try {
    // Verificar se o perfil já existe
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (existingProfile) {
      return existingProfile as UserProfile;
    }
    
    // Criar novo perfil se não existir
    const newProfile = {
      id: userId,
      name: userData.name || 'Usuário',
      email: userData.email || '',
      avatar_url: userData.avatar_url || null,
      role: userData.role || 'member',
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select('*')
      .single();
    
    if (error) throw error;
    return data as UserProfile;
  } catch (error) {
    console.error("Erro ao criar perfil:", error);
    return null;
  }
}

/**
 * Atualiza o perfil de usuário
 * @param userId ID do usuário
 * @param profileData Dados do perfil a serem atualizados
 * @returns Perfil atualizado
 */
export async function updateUserProfile(
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile | null> {
  if (!userId) return null;
  
  try {
    // Não permitir atualização de campos críticos
    const safeData = { ...profileData };
    delete safeData.id;
    delete safeData.created_at;
    
    const { data, error } = await supabase
      .from('profiles')
      .update(safeData)
      .eq('id', userId)
      .select('*')
      .single();
    
    if (error) throw error;
    return data as UserProfile;
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return null;
  }
}
