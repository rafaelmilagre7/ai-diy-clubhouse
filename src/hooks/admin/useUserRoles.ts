
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { logSecurityEvent, clearPermissionCache } from '@/contexts/auth/utils/securityUtils';

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
      
      // Buscar dados antigos para auditoria
      const { data: oldProfileData } = await supabase
        .from("profiles")
        .select("role, role_id")
        .eq("id", userId)
        .single();
      
      // Log da ação no sistema de auditoria de segurança
      await logSecurityEvent(
        'assign_role',
        'profile',
        userId,
        oldProfileData,
        { role_id: roleId }
      );
      
      // Atualizar o papel do usuário
      const { data, error } = await supabase
        .from("profiles")
        .update({ role_id: roleId })
        .eq("id", userId)
        .select();
      
      if (error) throw error;
      
      // Limpar caches relacionados
      roleCache.current.delete(userId);
      clearPermissionCache(userId);
      
      toast.success('Papel do usuário atualizado com sucesso');
      return data;
    } catch (err: any) {
      console.error('Erro ao atribuir papel:', err);
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
      return roleCache.current.get(userId)!;
    }
    
    try {
      console.log(`Buscando papel para usuário: ${userId}`);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("role_id, user_roles(*)")
        .eq("id", userId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar papel do usuário:', error);
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
      
      return result;
    } catch (err) {
      console.error('Erro ao buscar papel do usuário:', err);
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
