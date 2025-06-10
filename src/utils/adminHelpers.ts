
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { getUserRoleName } from '@/lib/supabase/types';

/**
 * Utilitários administrativos para a plataforma Viver de IA
 * 
 * Sistema limpo - onboarding removido na Fase 5.2
 */

export const verifyUserAccess = async (userEmail: string): Promise<{ success: boolean; message: string; hasAccess: boolean }> => {
  try {
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id, 
        role_id, 
        email,
        user_roles:role_id (
          name,
          permissions
        )
      `)
      .eq('email', userEmail)
      .single();
    
    if (profileError || !userProfile) {
      return { success: false, message: 'Usuário não encontrado', hasAccess: false };
    }
    
    // Usar getUserRoleName para obter o nome da role
    const roleName = userProfile.user_roles && typeof userProfile.user_roles === 'object' && 'name' in userProfile.user_roles
      ? userProfile.user_roles.name 
      : 'member';
    
    // Verificar se o usuário tem acesso básico à plataforma
    const hasBasicAccess = ['admin', 'formacao', 'membro_club', 'member'].includes(roleName || '');
    
    return {
      success: true,
      message: `Usuário ${userEmail}: Role=${roleName}, Acesso=${hasBasicAccess ? 'SIM' : 'NÃO'}`,
      hasAccess: hasBasicAccess
    };
    
  } catch (error) {
    console.error('Erro ao verificar acesso:', error);
    return { success: false, message: 'Erro interno', hasAccess: false };
  }
};

// Função helper para verificar acesso via console  
export const adminCheckUserAccess = async (userEmail: string) => {
  const result = await verifyUserAccess(userEmail);
  console.log(result.message);
  return result;
};

/**
 * Verifica se um usuário tem permissões específicas - agora usa role_id
 */
export const checkUserPermissions = async (userEmail: string, permission: string): Promise<{ success: boolean; message: string; hasPermission: boolean }> => {
  try {
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id, 
        role_id,
        user_roles:role_id (
          name,
          permissions
        )
      `)
      .eq('email', userEmail)
      .single();
    
    if (profileError || !userProfile) {
      return { success: false, message: 'Usuário não encontrado', hasPermission: false };
    }
    
    // Verificar permissões específicas via role_id
    let hasPermission = false;
    const userRoles = userProfile.user_roles as any;
    
    if (userRoles) {
      // Admin sempre tem todas as permissões
      if (userRoles.name === 'admin') {
        hasPermission = true;
      } else if (userProfile.role_id) {
        // Verificar permissões específicas na tabela role_permissions
        const { data: permissions } = await supabase
          .from('role_permissions')
          .select('permission')
          .eq('role_id', userProfile.role_id);
        
        hasPermission = permissions?.some(p => p.permission === permission) || false;
      }
    }
    
    return {
      success: true,
      message: `Usuário ${userEmail}: Permissão ${permission}=${hasPermission ? 'SIM' : 'NÃO'}`,
      hasPermission
    };
    
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return { success: false, message: 'Erro interno', hasPermission: false };
  }
};
