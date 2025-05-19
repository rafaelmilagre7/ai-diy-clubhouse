
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase/types';
import { validateRole, determineRoleFromEmail } from '@/contexts/auth/utils/profileUtils/roleValidation';
import { getUserProfile, createUserProfile } from '@/contexts/auth/utils/profileUtils/userProfileFunctions';

/**
 * Processa o perfil do usuário após autenticação.
 * Busca o perfil existente ou cria um novo se necessário.
 * 
 * @param userId - ID do usuário autenticado
 * @returns Promise com o perfil do usuário
 */
export async function processUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) {
    console.error("processUserProfile: userId é necessário");
    return null;
  }

  try {
    // Buscar dados do usuário no Auth
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("Erro ao obter dados do usuário:", userError);
      return null;
    }
    
    const { email, user_metadata } = userData.user;
    const name = user_metadata?.name || user_metadata?.full_name || 'Usuário';
    
    // Buscar perfil existente
    const existingProfile = await getUserProfile(userId);
    
    if (existingProfile) {
      // Se o perfil existe, apenas validar o role
      const role = validateRole(existingProfile.role);
      return { ...existingProfile, role };
    }
    
    // Determinar o papel baseado no email
    const role = email ? determineRoleFromEmail(email) : 'member';
    
    // Criar novo perfil
    return await createUserProfile(userId, {
      name,
      email: email || '',
      role
    });
    
  } catch (error) {
    console.error("Erro ao processar perfil do usuário:", error);
    return null;
  }
}
