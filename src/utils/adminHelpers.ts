
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const verifyNetworkingAccess = async (userEmail: string): Promise<{ success: boolean; message: string; hasAccess: boolean }> => {
  try {
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, role_id')
      .eq('email', userEmail)
      .single();
    
    if (profileError || !userProfile) {
      return { success: false, message: 'Usuário não encontrado', hasAccess: false };
    }
    
    // Verificar se o role permite acesso ao networking (apenas admin por enquanto)
    const allowedRoles = ['admin'];
    const hasRoleAccess = allowedRoles.includes(userProfile.role || '');
    
    // Verificar permissões específicas se houver role_id
    let hasPermissionAccess = false;
    if (userProfile.role_id) {
      const { data: permissions } = await supabase
        .from('role_permissions')
        .select('permission')
        .eq('role_id', userProfile.role_id);
      
      hasPermissionAccess = permissions?.some(p => p.permission === 'networking.access') || false;
    }
    
    const hasAccess = hasRoleAccess || hasPermissionAccess;
    
    return {
      success: true,
      message: `Usuário ${userEmail}: Role=${userProfile.role}, Acesso=${hasAccess ? 'SIM' : 'NÃO'}`,
      hasAccess
    };
    
  } catch (error) {
    console.error('Erro ao verificar acesso:', error);
    return { success: false, message: 'Erro interno', hasAccess: false };
  }
};

// Função helper para verificar acesso via console  
export const adminCheckNetworking = async (userEmail: string) => {
  const result = await verifyNetworkingAccess(userEmail);
  console.log(result.message);
  return result;
};
