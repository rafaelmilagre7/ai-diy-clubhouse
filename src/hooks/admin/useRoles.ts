
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  is_system?: boolean;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
}

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Erro ao carregar papéis:', error);
      toast.error('Erro ao carregar papéis');
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (roleData: CreateRoleData) => {
    try {
      setIsCreating(true);
      const { data, error } = await supabase
        .from('user_roles')
        .insert([roleData])
        .select()
        .single();

      if (error) throw error;

      setRoles(prev => [...prev, data]);
      toast.success('Papel criado com sucesso');
    } catch (error) {
      console.error('Erro ao criar papel:', error);
      toast.error('Erro ao criar papel');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateRole = async (roleId: string, roleData: UpdateRoleData) => {
    try {
      setIsUpdating(true);
      const { data, error } = await supabase
        .from('user_roles')
        .update(roleData)
        .eq('id', roleId)
        .select()
        .single();

      if (error) throw error;

      setRoles(prev => prev.map(role => 
        role.id === roleId ? data : role
      ));
      toast.success('Papel atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar papel:', error);
      toast.error('Erro ao atualizar papel');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      setRoles(prev => prev.filter(role => role.id !== roleId));
      toast.success('Papel removido com sucesso');
    } catch (error) {
      console.error('Erro ao remover papel:', error);
      toast.error('Erro ao remover papel');
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    loading,
    isCreating,
    isUpdating,
    isDeleting,
    createRole,
    updateRole,
    deleteRole,
    refetch: fetchRoles
  };
};
