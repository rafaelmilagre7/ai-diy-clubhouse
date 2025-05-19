
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/lib/supabase/types";

/**
 * Valida o papel do usuário com base no email
 */
export const validateUserRole = async (profile: UserProfile): Promise<string> => {
  if (!profile || !profile.email) return 'member';
  
  try {
    // Determinar o papel correto com base no email
    const correctRole = determineRoleFromEmail(profile.email);
    
    // Se o papel atual não corresponder ao esperado, atualizar no banco de dados
    if (correctRole !== profile.role) {
      await updateProfileRole(profile.id, correctRole);
      return correctRole;
    }
    
    return profile.role || 'member';
  } catch (error) {
    console.error('Erro ao validar papel do usuário:', error);
    return profile.role || 'member';
  }
};

/**
 * Determina o papel do usuário com base no email
 */
export const determineRoleFromEmail = (email: string): string => {
  if (!email) return 'member';
  
  // Emails administrativos
  if (
    email === 'admin@teste.com' || 
    email === 'admin@viverdeia.ai' ||
    email.endsWith('@viverdeia.ai')
  ) {
    return 'admin';
  }
  
  // Emails para formação
  if (
    email.endsWith('@formacao.viverdeia.ai') || 
    email.includes('formacao')
  ) {
    return 'formacao';
  }
  
  // Por padrão, retornar membro
  return 'member';
};

/**
 * Atualiza o papel do usuário no banco de dados
 */
const updateProfileRole = async (userId: string, role: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar papel do usuário:', error);
  }
};

/**
 * Verifica se o usuário é um super administrador
 */
export const isSuperAdmin = (profile: UserProfile): boolean => {
  return profile?.role === 'admin';
};
