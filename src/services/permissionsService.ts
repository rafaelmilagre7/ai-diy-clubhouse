
import { supabase } from '@/lib/supabase';

export type PermissionAssignment = {
  roleId: string;
  permissionId: string;
};

export const permissionsService = {
  // Atribuir permissão a um papel
  async assignPermissionToRole(roleId: string, permissionId: string) {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .insert({
          role_id: roleId,
          permission_id: permissionId
        })
        .select('*')
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atribuir permissão:', error);
      throw error;
    }
  },
  
  // Remover permissão de um papel
  async removePermissionFromRole(roleId: string, permissionId: string) {
    try {
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .match({ role_id: roleId, permission_id: permissionId });
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao remover permissão:', error);
      throw error;
    }
  },
  
  // Atribuir papel a um usuário
  async assignRoleToUser(userId: string, roleId: string) {
    try {
      // Registrar a ação no log
      await supabase.rpc('log_permission_change', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'assign_role',
        target_user_id: userId,
        role_id: roleId
      });
      
      // Atualizar o perfil do usuário
      const { data, error } = await supabase
        .from('profiles')
        .update({ role_id: roleId })
        .eq('id', userId)
        .select('*')
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atribuir papel ao usuário:', error);
      throw error;
    }
  },
  
  // Buscar permissões atribuídas a um papel
  async getPermissionsByRole(roleId: string) {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*, permission_definitions(*)')
        .eq('role_id', roleId);
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar permissões do papel:', error);
      throw error;
    }
  }
};
