
import { useState, useEffect, useCallback } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Estados para controlar diálogos
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      console.log('🔄 [ROLES] Iniciando carregamento de roles...');
      setLoading(true);
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ [ROLES] Erro ao carregar roles:', error);
        throw error;
      }

      console.log('✅ [ROLES] Roles carregados com sucesso:', data?.length || 0, 'roles');
      setRoles(data || []);
    } catch (error) {
      console.error('❌ [ROLES] Erro no fetchRoles:', error);
      setError(error as Error);
      
      // Fallback: tentar criar roles básicos se não existirem
      if (error instanceof Error && error.message.includes('relation "user_roles" does not exist')) {
        console.warn('⚠️ [ROLES] Tabela user_roles não existe, usando fallback');
        setRoles([]);
        toast.error('Tabela de papéis não encontrada. Contate o administrador.');
      } else {
        toast.error('Erro ao carregar papéis do sistema');
      }
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  }, []);

  const createRole = async (roleData: CreateRoleData) => {
    try {
      setIsCreating(true);
      console.log('🔄 [ROLES] Criando novo role:', roleData);
      
      const { data, error } = await supabase
        .from('user_roles')
        .insert([roleData])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ [ROLES] Role criado com sucesso:', data);
      setRoles(prev => [...prev, data]);
      toast.success('Papel criado com sucesso');
    } catch (error) {
      console.error('❌ [ROLES] Erro ao criar papel:', error);
      toast.error('Erro ao criar papel');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateRole = async (roleId: string, roleData: UpdateRoleData) => {
    try {
      setIsUpdating(true);
      console.log('🔄 [ROLES] Atualizando role:', roleId, roleData);
      
      const { data, error } = await supabase
        .from('user_roles')
        .update(roleData)
        .eq('id', roleId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ [ROLES] Role atualizado com sucesso:', data);
      setRoles(prev => prev.map(role => 
        role.id === roleId ? data : role
      ));
      toast.success('Papel atualizado com sucesso');
    } catch (error) {
      console.error('❌ [ROLES] Erro ao atualizar papel:', error);
      toast.error('Erro ao atualizar papel');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      setIsDeleting(true);
      console.log('🔄 [ROLES] Deletando role:', roleId);
      
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      console.log('✅ [ROLES] Role deletado com sucesso');
      setRoles(prev => prev.filter(role => role.id !== roleId));
      toast.success('Papel removido com sucesso');
    } catch (error) {
      console.error('❌ [ROLES] Erro ao remover papel:', error);
      toast.error('Erro ao remover papel');
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createRole,
    updateRole,
    deleteRole,
    refetch: fetchRoles,
    fetchRoles,
    // Estados de diálogo
    createDialogOpen,
    setCreateDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedRole,
    setSelectedRole
  };
};
