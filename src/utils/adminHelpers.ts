
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Utilitários administrativos para a plataforma Viver de IA
 * 
 * Nota: Funcionalidades relacionadas ao networking e trilha de implementação 
 * foram removidas nas fases de limpeza do sistema. Para rollback futuro, 
 * consultar histórico do git.
 */

export const verifyUserAccess = async (userEmail: string): Promise<{ success: boolean; message: string; hasAccess: boolean }> => {
  try {
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, role_id, email')
      .eq('email', userEmail)
      .single();
    
    if (profileError || !userProfile) {
      return { success: false, message: 'Usuário não encontrado', hasAccess: false };
    }
    
    // Verificar se o usuário tem acesso básico à plataforma
    const hasBasicAccess = ['admin', 'formacao', 'membro_club', 'member'].includes(userProfile.role || '');
    
    return {
      success: true,
      message: `Usuário ${userEmail}: Role=${userProfile.role}, Acesso=${hasBasicAccess ? 'SIM' : 'NÃO'}`,
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
 * Verifica se um usuário tem permissões específicas
 */
export const checkUserPermissions = async (userEmail: string, permission: string): Promise<{ success: boolean; message: string; hasPermission: boolean }> => {
  try {
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, role_id')
      .eq('email', userEmail)
      .single();
    
    if (profileError || !userProfile) {
      return { success: false, message: 'Usuário não encontrado', hasPermission: false };
    }
    
    // Verificar permissões específicas se houver role_id
    let hasPermission = false;
    if (userProfile.role_id) {
      const { data: permissions } = await supabase
        .from('role_permissions')
        .select('permission')
        .eq('role_id', userProfile.role_id);
      
      hasPermission = permissions?.some(p => p.permission === permission) || false;
    }
    
    // Fallback: admin sempre tem todas as permissões
    if (userProfile.role === 'admin') {
      hasPermission = true;
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
