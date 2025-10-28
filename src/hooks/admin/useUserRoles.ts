
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { secureLogger } from '@/utils/security/productionSafeLogging';
import { useCacheInvalidation } from './useCacheInvalidation';

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
  const { user, refetchProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const roleCache = useRef<Map<string, UserRoleResult>>(new Map());
  const { invalidateAllUserCaches } = useCacheInvalidation();

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
      
      // ✅ CORREÇÃO COMPLETA: Invalidar TODOS os caches
      console.log('🗑️ [USER-ROLES] Iniciando limpeza COMPLETA de caches...');
      
      // 1. Limpar cache local de roles
      roleCache.current.delete(userId);
      
      // 2. Invalidar todos os caches (local + React Query)
      await invalidateAllUserCaches(userId);
      
      // 3. ✅ NOVO: Se o usuário afetado está logado, forçar re-fetch do profile
      if (userId === user?.id && refetchProfile) {
        console.log('⚠️ [USER-ROLES] Usuário afetado está logado - forçando re-fetch do profile');
        await refetchProfile();
        
        toast.info('⚡ Seu papel foi atualizado', {
          description: 'As mudanças já estão ativas. Algumas páginas podem requerer recarregamento.',
          duration: 5000
        });
      }
      
      console.log('✅ [USER-ROLES] Todos os caches invalidados com sucesso');
      
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
  }, [user?.id, invalidateAllUserCaches, refetchProfile]);

  const getUserRole = useCallback(async (userId: string): Promise<UserRoleResult> => {
    if (roleCache.current.has(userId)) {
       if (!import.meta.env.PROD) {
        console.log(`🔄 [USER-ROLES] Retornando role do cache para: ${userId.substring(0, 8)}***`);
      }
      return roleCache.current.get(userId)!;
    }
    
    try {
       if (!import.meta.env.PROD) {
        console.log(`🔍 [USER-ROLES] Buscando papel para usuário: ${userId.substring(0, 8)}***`);
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          role_id,
          user_roles (
            id,
            name,
            description,
            permissions,
            is_system
          )
        `)
        .eq("id", userId)
        .maybeSingle();
      
      if (error) {
        // Log de erro sempre visível (crítico)
        console.error('❌ [USER-ROLES] Erro ao buscar papel do usuário:', error);
        return { roleId: null, roleName: null, roleData: null };
      }
      
      // Se não há dados, retornar valores nulos
      if (!data) {
        console.warn('⚠️ [USER-ROLES] Usuário não encontrado:', userId.substring(0, 8));
        return { roleId: null, roleName: null, roleData: null };
      }
      
      const roleId = data.role_id ? String(data.role_id) : null;
      let roleName: string | null = null;
      let roleData: any = null;
      
      // Log para debug
      if (!import.meta.env.PROD) {
        console.log('🔍 [USER-ROLES] Dados brutos:', data);
      }
      
      if (data.user_roles) {
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
      
      if (!import.meta.env.PROD) {
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
