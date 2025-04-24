
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase/types';

// Lista de emails conhecidos para super admins
const SUPER_ADMIN_EMAILS = [
  'admin@viverdeia.ai',
  'admin@teste.com',
  'admin@viver.ai'
];

/**
 * Verifica se um email pertence a um super admin
 */
export const isSuperAdmin = (email: string): boolean => {
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Determina o papel/role do usuário com base no email
 * Esta função é usada ao criar um novo perfil para determinação inicial do papel
 */
export const determineRoleFromEmail = (email: string): 'admin' | 'member' => {
  // Se o email pertence ao domínio viverdeia.ai ou é um email de teste admin, é considerado admin
  if (
    email.toLowerCase().endsWith('@viverdeia.ai') ||
    SUPER_ADMIN_EMAILS.includes(email.toLowerCase())
  ) {
    return 'admin';
  }
  
  // Caso contrário, é um membro comum
  return 'member';
};

/**
 * Valida se o papel atual do usuário é apropriado
 * Se necessário, atualiza o papel no banco de dados
 */
export const validateUserRole = async (
  profileId: string,
  currentRole: 'admin' | 'member',
  email?: string | null
): Promise<'admin' | 'member'> => {
  // Se não temos email, manter o papel atual
  if (!email) {
    console.log(`Sem email para validar papel para perfil: ${profileId}`);
    return currentRole;
  }
  
  // Determinar o papel esperado com base no email
  const expectedRole = determineRoleFromEmail(email);
  
  // Se o papel atual é diferente do esperado, atualizamos no banco de dados
  if (currentRole !== expectedRole) {
    console.log(`Papel atual (${currentRole}) diferente do esperado (${expectedRole}) para ${email}. Atualizando...`);
    
    try {
      // Atualizar o papel no perfil
      const { error } = await supabase
        .from('profiles')
        .update({ role: expectedRole })
        .eq('id', profileId);
      
      if (error) {
        console.error('Erro ao atualizar papel do usuário:', error);
        // Em caso de erro, mantemos o papel atual para não interromper o fluxo
        return currentRole;
      }
      
      console.log(`Papel atualizado com sucesso para ${expectedRole}`);
      
      // Atualizar metadados do usuário para manter consistência
      await supabase.auth.updateUser({
        data: { role: expectedRole }
      });
      
      return expectedRole;
    } catch (error) {
      console.error('Erro inesperado ao atualizar papel:', error);
      return currentRole;
    }
  }
  
  // Se o papel é o mesmo que o esperado, apenas retornamos
  return currentRole;
};
