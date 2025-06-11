
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { logSecurityEvent, clearPermissionCache } from '@/contexts/auth/utils/securityUtils';
import { clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
import { useAdminCheck } from '@/hooks/auth/useAdminCheck';

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
  const { checkIsAdmin } = useAdminCheck();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const roleCache = useRef<Map<string, UserRoleResult>>(new Map());

  const assignRoleToUser = useCallback(async (userId: string, roleId: string) => {
    try {
      setIsUpdating(true);
      setError(null);
      
      // CORREÇÃO CRÍTICA: Verificar admin usando função do banco
      const isUserAdmin = await checkIsAdmin();
      if (!isUserAdmin) {
        const errorMsg = 'Acesso negado: apenas administradores podem alterar papéis';
        console.error('❌ [USER-ROLES] ' + errorMsg);
        throw new Error(errorMsg);
      }
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔄 [USER-ROLES] Iniciando atribuição de role: userId=${userId.substring(0, 8)}***, roleId=${roleId}`);
      }
      
      // Buscar dados antigos para auditoria
      const { data: oldProfileData } = await supabase
        .from("profiles")
        .select("role_id")
        .eq("id", userId)
        .single();
      
      // Log da ação no sistema de auditoria de segurança
      await logSecurityEvent(
        'assign_role',
        'profiles',
        userId
      );
      
      // Atualizar o papel do usuário - apenas role_id
      const { data, error } = await supabase
        .from("profiles")
        .update({ role_id: roleId })
        .eq("id", userId)
        .select();
      
      if (error) {
        console.error('❌ [USER-ROLES] Erro ao atualizar role:', error);
        throw error;
      }
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ [USER-ROLES] Role atualizado com sucesso no banco de dados');
      }
      
      // Invalidação de cache mais abrangente para sincronização imediata
      roleCache.current.delete(userId);
      clearPermissionCache(userId);
      clearProfileCache();
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('🧹 [USER-ROLES] Cache de perfil e permissões limpo para sincronização imediata');
      }
      
      toast.success('Papel do usuário atualizado com sucesso');
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('🎉 [USER-ROLES] Operação concluída com sucesso');
      }
      
      return data;
    } catch (err: any) {
      console.error('❌ [USER-ROLES] Erro ao atribuir papel:', err);
      setError(err);
      toast.error('Erro ao atualizar papel', {
        description: err.message || 'Não foi possível atribuir o papel ao usuário.'
      });
      throw err;
    } finally {
      setIsUpdating(false);
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ [USER-ROLES] Finalizando operação assignRoleToUser');
      }
    }
  }, [checkIsAdmin]);

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
