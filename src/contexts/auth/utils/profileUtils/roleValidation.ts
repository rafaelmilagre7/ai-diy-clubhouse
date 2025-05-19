
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/lib/supabase/types";

/**
 * Verifica e valida o papel do usuário com base no email
 * @param profileId ID do perfil do usuário
 * @param currentRole Papel atual do usuário
 * @param email Email do usuário
 * @returns Papel validado
 */
export async function validateUserRole(
  profileId: string, 
  currentRole: string, 
  email: string | null
): Promise<string> {
  if (!email) return currentRole;
  
  // Determinar o papel correto com base no email
  let correctRole = determineRoleFromEmail(email);
  
  // Se o papel não corresponde ao email, atualizar no banco de dados
  if (currentRole !== correctRole) {
    try {
      await supabase
        .from('profiles')
        .update({ role: correctRole })
        .eq('id', profileId);
        
      console.log(`Papel atualizado de ${currentRole} para ${correctRole}`);
    } catch (error) {
      console.error('Erro ao atualizar papel do usuário:', error);
    }
  }
  
  return correctRole;
}

/**
 * Determina o papel baseado no endereço de email
 * @param email Email do usuário
 * @returns Papel determinado
 */
function determineRoleFromEmail(email: string): string {
  if (!email) return 'member';
  
  // Admin: emails da empresa ou específicos de administração
  if (email.includes('@viverdeia.ai') || email === 'admin@teste.com') {
    return 'admin';
  }
  
  // Formação: emails relacionados à formação
  if (email.includes('@formacao.viverdeia.ai') || email.includes('formacao@')) {
    return 'formacao';
  }
  
  // Por padrão, atribuir papel de membro
  return 'member';
}

/**
 * Busca o papel de um usuário pelo seu ID
 * @param userId ID do usuário
 * @returns Papel do usuário ou null se não encontrado
 */
export async function getUserRoleById(userId: string): Promise<string | null> {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data?.role || null;
  } catch (error) {
    console.error('Erro ao buscar papel do usuário:', error);
    return null;
  }
}
