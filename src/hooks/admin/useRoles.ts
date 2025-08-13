
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

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Erro ao carregar papéis:', error);
      setError(error as Error);
      toast.error('Erro ao carregar papéis');
    } finally {
      setIsLoading(false);
    }
  };

  const createRole = async (roleData: CreateRoleData) => {
    try {
      setIsCreating(true);
      console.log('🔄 Tentando criar role via método direto:', roleData);
      
      const { data, error } = await supabase
        .from('user_roles')
        .insert([roleData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro no método direto:', error);
        
        // Se for erro 409 (Conflict) ou 42501 (insufficient privilege), tentar RPC
        if (error.code === '42501' || error.code === 'PGRST116' || error.message?.includes('409')) {
          console.log('🔄 Tentando via função RPC segura...');
          return await createRoleSecure(roleData);
        }
        
        throw error;
      }

      console.log('✅ Role criado via método direto:', data);
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

  const createRoleSecure = async (roleData: CreateRoleData) => {
    try {
      console.log('🔐 Criando role via RPC segura:', roleData);
      
      const { data, error } = await supabase.rpc('secure_create_role', {
        p_name: roleData.name,
        p_description: roleData.description || null,
        p_is_system: roleData.is_system || false
      });

      if (error) {
        console.error('❌ Erro na função RPC:', error);
        throw error;
      }

      if (!data?.success) {
        console.error('❌ RPC retornou erro:', data);
        throw new Error(data?.error || 'Erro desconhecido na criação do role');
      }

      console.log('✅ Role criado via RPC:', data.data);
      
      // Adicionar o novo role à lista
      const newRole = data.data;
      setRoles(prev => [...prev, newRole]);
      toast.success(data.message || 'Papel criado com sucesso via RPC');
      
      return newRole;
    } catch (error) {
      console.error('Erro na função RPC segura:', error);
      throw error;
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
