
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { clearPermissionCache } from '@/contexts/auth/utils/securityUtils';
import { clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
import { secureLogger } from '@/utils/security/productionSafeLogging';

interface UserRoleResult {
  roleId: string | null;
  roleName: string | null;
  roleData: any | null;
}

interface UserRoleData {
  name?: string;
  [key: string]: any;
}

export function useUserRoles() {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const roleCache = useRef<Map<string, UserRoleResult>>(new Map());

  const assignRoleToUser = useCallback(async (userId: string, roleId: string) => {
    try {
      setIsUpdating(true);
      setError(null);
      
      // SEGURANÇA: Log seguro da operação
      secureLogger.info({
        level: 'info',
        message: 'Role assignment initiated',
        userId: user?.id,
        data: { targetUser: userId, newRole: roleId }
      });
      
      // SEGURANÇA: Usar função RPC segura aprimorada com log de segurança
      const { data: result, error: rpcError } = await supabase.rpc('secure_assign_role', {
        target_user_id: userId,
        new_role_id: roleId
      });
      
      if (rpcError) {
        secureLogger.error({
          level: 'error',
          message: 'RPC error in role assignment',
          userId: user?.id,
          data: { error: rpcError.message, targetUser: userId }
        });
        throw new Error(`Falha na atribuição de papel: ${rpcError.message}`);
      }
      
      if (!result?.success) {
        secureLogger.warn({
          level: 'warn',
          message: 'Role assignment rejected',
          userId: user?.id,
          data: { result, targetUser: userId }
        });
        throw new Error(result?.message || 'Atribuição de papel não autorizada');
      }
      
      // CORREÇÃO: Invalidação de cache mais abrangente para sincronização imediata
      roleCache.current.delete(userId);
      clearPermissionCache(userId);
      clearProfileCache();
      
      secureLogger.info({
        level: 'info',
        message: 'Role assignment completed successfully',
        userId: user?.id,
        data: { targetUser: userId, result }
      });
      
      toast.success('Papel do usuário atualizado com sucesso');
      return result;
      
    } catch (err: any) {
      secureLogger.error({
        level: 'error',
        message: 'Role assignment failed',
        userId: user?.id,
        data: { error: err.message, targetUser: userId }
      });
      
      setError(err);
      toast.error('Erro ao atualizar papel', {
        description: err.message || 'Não foi possível atribuir o papel ao usuário.'
      });
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [user?.id]);

  const getUserRole = useCallback(async (userId: string): Promise<UserRoleResult> => {
    if (roleCache.current.has(userId)) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔄 [USER-ROLES] Retornando role do cache para: ${userId.substring(0, 8)}***`);
      }
      return roleCache.current.get(userId)!;
    }
    
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔍 [USER-ROLES] Buscando papel para usuário: ${userId.substring(0, 8)}***`);
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          role_id,
          user_roles:role_id (
            id,
            name,
            description,
            permissions,
            is_system
          )
        `)
        .eq("id", userId)
        .single();
      
      if (error) {
        // Log de erro sempre visível (crítico)
        console.error('❌ [USER-ROLES] Erro ao buscar papel do usuário:', error);
        return { roleId: null, roleName: null, roleData: null };
      }
      
      const roleId = data?.role_id ? String(data.role_id) : null;
      let roleName: string | null = null;
      let roleData: any = null;
      
      if (data?.user_roles) {
        if (Array.isArray(data.user_roles)) {
          if (data.user_roles.length > 0) {
            const firstRole = data.user_roles[0] as UserRoleData;
            roleName = firstRole.name !== undefined ? String(firstRole.name) : null;
            roleData = firstRole;
          }
        } else if (typeof data.user_roles === 'object' && data.user_roles !== null) {
          const roleObject = data.user_roles as UserRoleData;
          roleName = roleObject.name !== undefined ? String(roleObject.name) : null;
          roleData = roleObject;
        }
      }
      
      const result: UserRoleResult = { roleId, roleName, roleData };
      roleCache.current.set(userId, result);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`✅ [USER-ROLES] Role carregado: ${roleName || 'undefined'} para usuário ${userId.substring(0, 8)}***`);
      }
      return result;
    } catch (err) {
      // Log de erro sempre visível (crítico)
      console.error('❌ [USER-ROLES] Erro ao buscar papel do usuário:', err);
      return { roleId: null, roleName: null, roleData: null };
    }
  }, []);

  return {
    assignRoleToUser,
    getUserRole,
    isUpdating,
    error
  };
}
