
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, any>;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export const useRoles = () => {
  const { isAdmin } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoles = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar roles:', error);
      toast.error('Erro ao carregar roles');
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .insert([roleData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Role criada com sucesso!');
      await fetchRoles(); // Recarregar lista
      return data;
    } catch (error: any) {
      console.error('Erro ao criar role:', error);
      toast.error('Erro ao criar role: ' + error.message);
      throw error;
    }
  };

  const updateRole = async (roleId: string, updates: Partial<Role>) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', roleId);

      if (error) throw error;

      toast.success('Role atualizada com sucesso!');
      await fetchRoles(); // Recarregar lista
    } catch (error: any) {
      console.error('Erro ao atualizar role:', error);
      toast.error('Erro ao atualizar role: ' + error.message);
      throw error;
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      // Verificar se há usuários usando esta role
      const { data: usersWithRole, error: usersError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role_id', roleId);

      if (usersError) throw usersError;

      if (usersWithRole && usersWithRole.length > 0) {
        toast.error(`Não é possível deletar: ${usersWithRole.length} usuário(s) ainda usa(m) esta role`);
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast.success('Role deletada com sucesso!');
      await fetchRoles(); // Recarregar lista
    } catch (error: any) {
      console.error('Erro ao deletar role:', error);
      toast.error('Erro ao deletar role: ' + error.message);
      throw error;
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchRoles();
    }
  }, [isAdmin]);

  return {
    roles,
    loading,
    createRole,
    updateRole,
    deleteRole,
    refetch: fetchRoles
  };
};
