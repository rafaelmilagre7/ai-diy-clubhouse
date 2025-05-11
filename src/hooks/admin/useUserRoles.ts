
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

// Interface melhorada para o retorno da função getUserRole
interface UserRoleResult {
  roleId: string | null;
  roleName: string | null;
  roleData: any | null;
}

// Interface para os diferentes formatos de dados de user_roles
interface UserRoleData {
  name?: string;
  [key: string]: any;
}

export function useUserRoles() {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // Adicionar cache simples para evitar consultas repetidas
  const roleCache = useRef<Map<string, UserRoleResult>>(new Map());

  // Atribuir papel ao usuário
  const assignRoleToUser = useCallback(async (userId: string, roleId: string) => {
    try {
      setIsUpdating(true);
      setError(null);
      
      // Registrar a ação no log de auditoria
      await supabase.rpc('log_permission_change', {
        user_id: user?.id,
        action_type: 'assign_role',
        target_user_id: userId,
        role_id: roleId
      });
      
      // Atualizar o papel do usuário
      const { data, error } = await supabase
        .from("profiles")
        .update({ role_id: roleId })
        .eq("id", userId)
        .select();
      
      if (error) throw error;
      
      // Limpar o cache para este usuário
      roleCache.current.delete(userId);
      
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

  // Buscar o papel atual de um usuário com tratamento robusto para diferentes estruturas de dados
  const getUserRole = useCallback(async (userId: string): Promise<UserRoleResult> => {
    // Verificar se já temos os dados em cache
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
      
      console.log('Dados retornados do Supabase:', data);
      
      // Garantir que role_id seja convertido para string ou definido como null
      const roleId = data?.role_id ? String(data.role_id) : null;
      
      // Inicializar variáveis
      let roleName: string | null = null;
      let roleData: any = null;
      
      // Tratamento robusto para diferentes formatos de retorno
      if (data?.user_roles) {
        // Verifica se é um array
        if (Array.isArray(data.user_roles)) {
          if (data.user_roles.length > 0) {
            const firstRole = data.user_roles[0] as UserRoleData;
            roleName = firstRole.name !== undefined ? String(firstRole.name) : null;
            roleData = firstRole;
            console.log('Papel encontrado (array):', roleName);
          } else {
            console.log('Array user_roles vazio');
          }
        } 
        // Verifica se é um objeto com propriedade name
        else if (typeof data.user_roles === 'object' && data.user_roles !== null) {
          const roleObject = data.user_roles as UserRoleData;
          roleName = roleObject.name !== undefined ? String(roleObject.name) : null;
          roleData = roleObject;
          console.log('Papel encontrado (objeto):', roleName);
        } else {
          console.log('user_roles não é array nem objeto:', typeof data.user_roles);
        }
      } else {
        console.log('user_roles não encontrado nos dados');
      }
      
      // Criar resultado
      const result: UserRoleResult = {
        roleId,
        roleName,
        roleData
      };
      
      // Armazenar em cache
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
