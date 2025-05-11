
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export function useUserRoles() {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

  // Buscar o papel atual de um usuário
  const getUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role_id, user_roles(*)")
        .eq("id", userId)
        .single();
      
      if (error) throw error;
      
      return {
        roleId: data.role_id,
        roleName: data.user_roles && typeof data.user_roles === 'object' && 'name' in data.user_roles ? data.user_roles.name : null,
        roleData: data.user_roles
      };
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
