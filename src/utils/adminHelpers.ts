
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const resetUserOnboarding = async (userEmail: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`Iniciando reset do onboarding para: ${userEmail}`);
    
    // Buscar o usuário pelo email
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();
    
    if (profileError || !userProfile) {
      return { success: false, message: 'Usuário não encontrado' };
    }
    
    const userId = userProfile.id;
    
    // Resetar dados do onboarding_progress
    const { error: progressError } = await supabase
      .from('onboarding_progress')
      .delete()
      .eq('user_id', userId);
    
    if (progressError) {
      console.error('Erro ao deletar progresso:', progressError);
    }
    
    // Resetar dados da tabela onboarding (legacy)
    const { error: onboardingError } = await supabase
      .from('onboarding')
      .delete()
      .eq('user_id', userId);
    
    if (onboardingError) {
      console.error('Erro ao deletar onboarding legacy:', onboardingError);
    }
    
    // Resetar trilhas de implementação
    const { error: trailError } = await supabase
      .from('implementation_trails')
      .delete()
      .eq('user_id', userId);
    
    if (trailError) {
      console.error('Erro ao deletar trilhas:', trailError);
    }
    
    console.log(`Reset completo para usuário ${userEmail} (${userId})`);
    return { success: true, message: 'Dados resetados com sucesso' };
    
  } catch (error) {
    console.error('Erro ao resetar dados:', error);
    return { success: false, message: 'Erro interno ao resetar dados' };
  }
};

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

// Função helper para admins resetarem dados via console
export const adminResetUser = async (userEmail: string) => {
  const result = await resetUserOnboarding(userEmail);
  if (result.success) {
    toast.success(`Dados do usuário ${userEmail} foram resetados com sucesso`);
  } else {
    toast.error(`Erro ao resetar dados: ${result.message}`);
  }
  return result;
};

// Função helper para verificar acesso via console  
export const adminCheckNetworking = async (userEmail: string) => {
  const result = await verifyNetworkingAccess(userEmail);
  console.log(result.message);
  return result;
};
