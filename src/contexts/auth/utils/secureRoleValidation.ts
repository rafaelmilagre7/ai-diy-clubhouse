import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { secureLogger } from '@/utils/security/productionSafeLogging';

/**
 * Validação segura de papéis que usa apenas is_user_admin()
 */
export const validateUserRole = async (userId: string): Promise<{
  isAdmin: boolean;
  roleName: string;
  profile: UserProfile | null;
}> => {
  try {
    // Usar função RPC segura para verificar admin
    const { data: isAdminResult, error: adminError } = await supabase
      .rpc('is_user_admin', { user_id: userId });
    
    if (adminError) {
      secureLogger.error({
        level: 'error',
        message: 'Error validating admin status',
        userId,
        data: { error: adminError.message }
      });
      return { isAdmin: false, roleName: 'member', profile: null };
    }
    
    // Buscar perfil completo
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles:role_id (
          id,
          name,
          description,
          permissions
        )
      `)
      .eq('id', userId)
      .single();
    
    if (profileError || !profile) {
      secureLogger.warn({
        level: 'warn',
        message: 'Profile not found during role validation',
        userId,
        data: { error: profileError?.message }
      });
      return { isAdmin: false, roleName: 'member', profile: null };
    }
    
    const roleName = profile.user_roles?.name || 'member';
    
    secureLogger.debug({
      level: 'debug',
      message: 'Role validation completed',
      userId,
      data: { 
        isAdmin: isAdminResult,
        roleName,
        hasUserRoles: !!profile.user_roles
      }
    });
    
    return {
      isAdmin: Boolean(isAdminResult),
      roleName: String(roleName),
      profile: profile as UserProfile
    };
    
  } catch (error) {
    secureLogger.error({
      level: 'error',
      message: 'Critical error in role validation',
      userId,
      data: { error }
    });
    return { isAdmin: false, roleName: 'member', profile: null };
  }
};

/**
 * Verifica se o usuário tem permissão para uma ação específica
 */
export const checkUserPermission = async (
  userId: string, 
  permission: string
): Promise<boolean> => {
  try {
    const { data: hasPermission, error } = await supabase
      .rpc('user_has_permission', { 
        user_id: userId, 
        permission_code: permission 
      });
    
    if (error) {
      secureLogger.warn({
        level: 'warn',
        message: 'Permission check failed',
        userId,
        data: { permission, error: error.message }
      });
      return false;
    }
    
    const allowed = Boolean(hasPermission);
    
    secureLogger.debug({
      level: 'debug',
      message: 'Permission check completed',
      userId,
      data: { permission, allowed }
    });
    
    return allowed;
    
  } catch (error) {
    secureLogger.error({
      level: 'error',
      message: 'Critical error in permission check',
      userId,
      data: { permission, error }
    });
    return false;
  }
};

/**
 * Valida mudança de papel de forma segura
 */
export const validateRoleChange = async (
  adminId: string,
  targetUserId: string, 
  newRoleId: string
): Promise<{ allowed: boolean; reason?: string }> => {
  try {
    // Verificar se o admin tem permissão
    const adminValidation = await validateUserRole(adminId);
    if (!adminValidation.isAdmin) {
      secureLogger.security('Unauthorized role change attempt', adminId, {
        targetUser: targetUserId,
        newRole: newRoleId
      });
      return { allowed: false, reason: 'Insufficient permissions' };
    }
    
    // Usar função RPC segura para validar a mudança
    const { data: isValid, error } = await supabase
      .rpc('validate_role_change', {
        target_user_id: targetUserId,
        new_role_id: newRoleId
      });
    
    if (error || !isValid) {
      secureLogger.security('Role change validation failed', adminId, {
        targetUser: targetUserId,
        newRole: newRoleId,
        error: error?.message
      });
      return { allowed: false, reason: error?.message || 'Role change not allowed' };
    }
    
    secureLogger.info({
      level: 'info',
      message: 'Role change validated successfully',
      userId: adminId,
      data: { targetUser: targetUserId, newRole: newRoleId }
    });
    
    return { allowed: true };
    
  } catch (error) {
    secureLogger.error({
      level: 'error',
      message: 'Critical error in role change validation',
      userId: adminId,
      data: { targetUser: targetUserId, newRole: newRoleId, error }
    });
    return { allowed: false, reason: 'Validation failed' };
  }
};

/**
 * Função utilitária para obter nome do papel de forma segura
 */
export const getUserRoleName = (profile: UserProfile | null): string => {
  if (!profile) return 'member';
  
  // Priorizar user_roles table (novo sistema)
  if (profile.user_roles?.name) {
    return String(profile.user_roles.name);
  }
  
  // Fallback para role direto (compatibilidade)
  if (profile.role) {
    secureLogger.debug({
      level: 'debug',
      message: 'Using legacy role field',
      userId: profile.id,
      data: { role: profile.role }
    });
    return String(profile.role);
  }
  
  return 'member';
};

/**
 * Verifica se usuário é admin de forma segura
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  const validation = await validateUserRole(userId);
  return validation.isAdmin;
};