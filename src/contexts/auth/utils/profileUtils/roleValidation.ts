
import { UserRole } from '@/types/supabaseTypes';
import { supabase } from '@/lib/supabase';

/**
 * Determines the user role based on email address
 */
export const determineRoleFromEmail = (email: string | undefined | null): UserRole => {
  if (!email) return 'member';
  
  // Lista de emails administrativos
  const isAdminEmail = email === 'admin@teste.com' || 
                        email === 'admin@viverdeia.ai' || 
                        email === 'rafael@viverdeia.ai' ||
                        email?.endsWith('@viverdeia.ai');
                        
  return isAdminEmail ? 'admin' : 'member';
};

/**
 * Verifica se um usuário é o Super Admin (rafael@viverdeia.ai)
 */
export const isSuperAdmin = (email: string | undefined | null): boolean => {
  return email === 'rafael@viverdeia.ai';
};

/**
 * Validates if a user has the correct role and updates if needed
 */
export const validateUserRole = async (profileId: string, currentRole: UserRole, email: string | null): Promise<UserRole> => {
  if (!email) return currentRole;
  
  const correctRole = determineRoleFromEmail(email);
  
  // Se role não corresponde ao email, atualizar no banco de dados
  if (currentRole !== correctRole) {
    console.log(`Atualizando papel de ${currentRole} para ${correctRole}...`);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: correctRole })
        .eq('id', profileId);
      
      if (error) {
        console.error(`Erro ao atualizar papel para ${correctRole}:`, error);
        return currentRole; // Manter papel existente em caso de erro
      }
      
      console.log(`Papel atualizado para ${correctRole} no banco de dados`);
      
      // Também atualizar metadados do usuário
      await updateUserMetadata(correctRole);
      
      return correctRole;
    } catch (error) {
      console.error(`Erro ao atualizar papel para ${correctRole}:`, error);
      return currentRole; // Manter papel existente em caso de erro
    }
  }
  
  return currentRole;
};

/**
 * Updates the user metadata with role information
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
