
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

/**
 * Hook para verificações de admin usando a função security definer do banco
 * CORREÇÃO CRÍTICA: Remove dependência de emails hardcoded
 */
export const useAdminCheck = () => {
  
  // Verificar se o usuário atual é admin
  const checkIsAdmin = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        logger.error('[USE-ADMIN-CHECK] Erro ao verificar admin:', {
          error: error.message,
          component: 'useAdminCheck'
        });
        return false;
      }
      
      return Boolean(data);
    } catch (error) {
      logger.error('[USE-ADMIN-CHECK] Erro crítico:', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        component: 'useAdminCheck'
      });
      return false;
    }
  }, []);

  // Verificar se um usuário específico é admin
  const checkUserIsAdmin = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_admin', { check_user_id: userId });
      
      if (error) {
        logger.error('[USE-ADMIN-CHECK] Erro ao verificar admin do usuário:', {
          error: error.message,
          userId: userId.substring(0, 8) + '***',
          component: 'useAdminCheck'
        });
        return false;
      }
      
      return Boolean(data);
    } catch (error) {
      logger.error('[USE-ADMIN-CHECK] Erro crítico ao verificar usuário:', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        userId: userId.substring(0, 8) + '***',
        component: 'useAdminCheck'
      });
      return false;
    }
  }, []);

  // Verificar papel do usuário atual
  const getCurrentUserRole = useCallback(async (): Promise<string> => {
    try {
      const { data, error } = await supabase.rpc('get_current_user_role');
      
      if (error) {
        logger.error('[USE-ADMIN-CHECK] Erro ao buscar papel do usuário:', {
          error: error.message,
          component: 'useAdminCheck'
        });
        return 'member';
      }
      
      return data || 'member';
    } catch (error) {
      logger.error('[USE-ADMIN-CHECK] Erro crítico ao buscar papel:', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        component: 'useAdminCheck'
      });
      return 'member';
    }
  }, []);

  // Verificar se usuário tem papel específico
  const checkUserHasRole = useCallback(async (roleName: string, userId?: string): Promise<boolean> => {
    try {
      const params = userId ? { role_name: roleName, check_user_id: userId } : { role_name: roleName };
      const { data, error } = await supabase.rpc('has_role_name', params);
      
      if (error) {
        logger.error('[USE-ADMIN-CHECK] Erro ao verificar papel:', {
          error: error.message,
          roleName,
          userId: userId ? userId.substring(0, 8) + '***' : 'current',
          component: 'useAdminCheck'
        });
        return false;
      }
      
      return Boolean(data);
    } catch (error) {
      logger.error('[USE-ADMIN-CHECK] Erro crítico ao verificar papel:', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        roleName,
        userId: userId ? userId.substring(0, 8) + '***' : 'current',
        component: 'useAdminCheck'
      });
      return false;
    }
  }, []);

  return {
    checkIsAdmin,
    checkUserIsAdmin,
    getCurrentUserRole,
    checkUserHasRole,
  };
};
