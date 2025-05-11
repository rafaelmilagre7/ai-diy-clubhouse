
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
  permissions?: string[];
}

interface RoleCreate {
  name: string;
  description: string;
  is_system: boolean;
}

interface RoleUpdate {
  name: string;
  description: string;
}

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Buscar todos os papéis
  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('is_system', { ascending: false })
        .order('name');
        
      if (error) throw error;
      
      setRoles(data || []);
    } catch (err) {
      console.error('Erro ao buscar papéis:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Criar novo papel
  const createRole = async (role: RoleCreate) => {
    try {
      setIsCreating(true);
      
      const { data, error } = await supabase
        .from('user_roles')
        .insert(role)
        .select()
        .single();
        
      if (error) throw error;
      
      setRoles(prev => [...prev, data]);
      toast.success('Papel criado com sucesso!');
      return data;
    } catch (err: any) {
      console.error('Erro ao criar papel:', err);
      if (err.code === '23505') {
        toast.error('Erro ao criar papel', {
          description: 'Já existe um papel com este nome'
        });
      } else {
        toast.error('Erro ao criar papel');
      }
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  // Atualizar papel existente
  const updateRole = async (id: string, role: RoleUpdate) => {
    try {
      setIsUpdating(true);
      
      const { data, error } = await supabase
        .from('user_roles')
        .update(role)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      setRoles(prev => prev.map(r => r.id === id ? data : r));
      toast.success('Papel atualizado com sucesso!');
      return data;
    } catch (err) {
      console.error('Erro ao atualizar papel:', err);
      toast.error('Erro ao atualizar papel');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Excluir papel
  const deleteRole = async (id: string) => {
    try {
      setIsDeleting(true);
      
      // Primeiro verificamos se há usuários usando este papel
      const { data: usersWithRole, error: usersCheckError } = await supabase
        .from('profiles')
        .select('count')
        .eq('role_id', id);
        
      if (usersCheckError) throw usersCheckError;
      
      const userCount = parseInt(String(usersWithRole?.[0]?.count || '0'));
      if (userCount > 0) {
        throw new Error(`Não é possível excluir este papel pois existem ${userCount} usuários associados a ele.`);
      }
      
      // Excluir permissões associadas ao papel
      const { error: permissionsDeleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', id);
        
      if (permissionsDeleteError) throw permissionsDeleteError;
      
      // Excluir o papel
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setRoles(prev => prev.filter(r => r.id !== id));
      toast.success('Papel excluído com sucesso!');
    } catch (err: any) {
      console.error('Erro ao excluir papel:', err);
      throw err;
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return {
    roles,
    isLoading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    isCreating,
    isUpdating,
    isDeleting,
    selectedRole,
    setSelectedRole,
    createDialogOpen,
    setCreateDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen
  };
}
