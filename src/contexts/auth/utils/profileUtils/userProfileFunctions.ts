
import { supabase } from "@/lib/supabase";
import type { UserProfile, UserRole } from "@/lib/supabase/types";

/**
 * Obtém o perfil completo do usuário
 * @param userId ID do usuário
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    if (!userId) return null;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, user_roles:role_id(id, name, description)')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error("Erro ao buscar perfil:", error);
      return null;
    }
    
    return profile as UserProfile;
  } catch (err) {
    console.error("Erro ao processar perfil:", err);
    return null;
  }
}

/**
 * Cria um novo perfil de usuário se não existir
 * @param user Usuário autenticado
 */
export async function createUserProfile(user: any): Promise<UserProfile | null> {
  try {
    if (!user?.id) return null;
    
    // Verifica se já existe um perfil
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
      
    if (existingProfile) {
      return existingProfile as UserProfile;
    }
    
    // Determinar o papel correto
    let userRole: string = 'member';
    
    if (user.email) {
      if (user.email.includes('@viverdeia.ai') || user.email === 'admin@teste.com') {
        userRole = 'admin';
      } else if (user.email.includes('@formacao.viverdeia.ai')) {
        userRole = 'formacao';
      }
    }
    
    // Buscar ID do papel
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', userRole)
      .single();
      
    const roleId = roleData?.id;
    
    // Criar novo perfil
    const newProfile = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário',
      avatar_url: user.user_metadata?.avatar_url || '',
      role: userRole,
      role_id: roleId
    };
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .single();
      
    if (error) {
      console.error("Erro ao criar perfil:", error);
      return null;
    }
    
    return profile as UserProfile;
  } catch (err) {
    console.error("Erro ao criar perfil de usuário:", err);
    return null;
  }
}
