import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { validateUserRole, getUserRoleName, checkUserPermission } from '@/contexts/auth/utils/secureRoleValidation';
import { secureLogger } from '@/utils/security/productionSafeLogging';

/**
 * Hook seguro para validação de papéis e permissões
 */
export const useSecureRole = () => {
  const { user, profile } = useAuth();

  /**
   * Verifica se o usuário atual é admin
   */
  const isCurrentUserAdmin = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    const validation = await validateUserRole(user.id);
    return validation.isAdmin;
  }, [user?.id]);

  /**
   * Obtém o nome do papel do usuário atual de forma segura
   */
  const getCurrentUserRole = useCallback((): string => {
    return getUserRoleName(profile);
  }, [profile]);

  /**
   * Verifica se o usuário atual tem uma permissão específica
   */
  const hasPermission = useCallback(async (permission: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    return await checkUserPermission(user.id, permission);
  }, [user?.id]);

  /**
   * Valida se o usuário pode executar uma ação administrativa
   */
  const canPerformAdminAction = useCallback(async (action: string): Promise<boolean> => {
    if (!user?.id) {
      secureLogger.security('Admin action attempted without authentication', undefined, { action });
      return false;
    }

    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      secureLogger.security('Admin action attempted by non-admin user', user.id, { action });
      return false;
    }

    secureLogger.info({
      level: 'info',
      message: 'Admin action authorized',
      userId: user.id,
      data: { action }
    });

    return true;
  }, [user?.id, isCurrentUserAdmin]);

  /**
   * Obtém informações completas de papel do usuário
   */
  const getFullRoleInfo = useCallback(async () => {
    if (!user?.id) return null;
    
    return await validateUserRole(user.id);
  }, [user?.id]);

  return {
    isCurrentUserAdmin,
    getCurrentUserRole,
    hasPermission,
    canPerformAdminAction,
    getFullRoleInfo,
  };
};