
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/lib/supabase/types";
import { generateRandomString } from '@/utils/stringGenerator';

/**
 * Processa o perfil do usuário após autenticação
 * @param userId ID do usuário autenticado
 */
export async function processUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    // Buscar perfil do usuário
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, user_roles:role_id(id, name, description)')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }

    // Verificamos se precisamos criar um perfil
    if (!profile) {
      // Buscar dados do usuário para obter informações básicas
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return null;

      const user = userData.user;
      
      // Criar perfil básico
      const newProfile = {
        id: user.id,
        name: user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário',
        email: user.email || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        role: 'member',
        created_at: new Date().toISOString()
      };

      // Inserir novo perfil
      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (createError) {
        console.error('Erro ao criar perfil:', createError);
        return null;
      }

      return createdProfile as UserProfile;
    }

    return profile as UserProfile;
  } catch (err) {
    console.error('Erro ao processar perfil de usuário:', err);
    return null;
  }
}

/**
 * Obtém o papel do usuário com base no perfil
 * @param profile Perfil do usuário
 */
export function getUserRole(profile: UserProfile): string {
  return profile?.role || 'member';
}

/**
 * Valida autorização do usuário para acessar recursos específicos
 * @param profile Perfil do usuário
 * @param requiredRole Papel necessário (opcional)
 */
export function validateUserAuthorization(profile: UserProfile, requiredRole?: string): boolean {
  if (!profile) return false;
  if (!requiredRole) return true;
  
  const userRole = getUserRole(profile);
  
  // Admin tem acesso a tudo
  if (userRole === 'admin') return true;
  
  // Para outros papéis, verificar permissão específica
  return userRole === requiredRole;
}
