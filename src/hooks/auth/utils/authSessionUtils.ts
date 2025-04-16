
import { supabase } from '@/lib/supabase';
import { fetchUserProfile, createUserProfileIfNeeded } from '@/contexts/auth/utils/profileUtils';
import { UserRole } from '@/lib/supabase';

/**
 * Determines the user role based on email address
 */
export const determineRoleFromEmail = (email: string | undefined | null): UserRole => {
  if (!email) return 'member';
  
  const isAdminEmail = email === 'admin@teste.com' || 
                        email === 'admin@viverdeia.ai' || 
                        email?.endsWith('@viverdeia.ai');
                        
  return isAdminEmail ? 'admin' : 'member';
};

/**
 * Updates user role in the database if needed
 */
export const updateRoleIfNeeded = async (profileId: string, currentRole: UserRole, correctRole: UserRole): Promise<boolean> => {
  if (currentRole === correctRole) return true;
  
  console.log(`Atualizando papel de ${currentRole} para ${correctRole}...`);
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: correctRole })
      .eq('id', profileId);
    
    if (error) {
      console.error(`Erro ao atualizar papel para ${correctRole}:`, error);
      return false;
    }
    
    console.log(`Papel atualizado para ${correctRole} no banco de dados`);
    return true;
  } catch (error) {
    console.error(`Erro ao atualizar papel para ${correctRole}:`, error);
    return false;
  }
};

/**
 * Updates the user metadata with the correct role
 */
export const updateUserMetadata = async (role: UserRole): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: { role }
    });
    
    if (error) {
      console.error("Erro ao atualizar metadata do usuário:", error);
      return false;
    }
    
    console.log(`Metadata do usuário atualizada com papel: ${role}`);
    return true;
  } catch (error) {
    console.error("Erro ao atualizar metadata do usuário:", error);
    return false;
  }
};

/**
 * Creates a temporary profile in memory when database operations fail
 */
export const createTemporaryProfile = (userId: string, email: string | undefined | null, name: string | undefined | null): any => {
  const userRole = determineRoleFromEmail(email);
  
  console.log("Criando perfil temporário com role:", userRole);
  
  return {
    id: userId,
    email: email || 'sem-email@viverdeia.ai',
    name: name || 'Usuário',
    role: userRole,
    avatar_url: null,
    company_name: null,
    industry: null,
    created_at: new Date().toISOString()
  };
};

/**
 * Process user profile after authentication
 * Returns the profile with correct role
 */
export const processUserProfile = async (userId: string, email: string | undefined | null, name: string | undefined | null) => {
  try {
    // Tentar buscar o perfil do usuário
    console.log("Buscando perfil para usuário:", userId);
    let profile = await fetchUserProfile(userId);
    
    // Se não existir perfil ou ocorrer erro de política, criar um novo
    if (!profile) {
      console.log("Criando novo perfil para usuário:", userId);
      profile = await createUserProfileIfNeeded(
        userId, 
        email || 'sem-email@viverdeia.ai',
        name || 'Usuário'
      );
    }
    
    console.log("Perfil carregado com papel:", profile?.role);
    
    // Verificação adicional da role com base no email
    if (profile && email) {
      const correctRole = determineRoleFromEmail(email);
      
      // IMPORTANTE: se o perfil não corresponder ao e-mail, atualizá-lo no banco de dados
      if (profile.role !== correctRole) {
        await updateRoleIfNeeded(profile.id, profile.role, correctRole);
        profile.role = correctRole;
      }
      
      // Atualiza os metadados do usuário
      await updateUserMetadata(correctRole);
    }
    
    console.log("Perfil final carregado com papel:", profile?.role);
    return profile;
  } catch (error) {
    console.error("Erro ao processar perfil de usuário:", error);
    
    // Como fallback, crie um perfil temporário na memória
    return createTemporaryProfile(userId, email, name);
  }
};
