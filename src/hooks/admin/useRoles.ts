
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

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
  const { user, session, isAdmin } = useAuth();
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

  // Função para verificar status da sessão
  const checkAuthStatus = async () => {
    console.log('🔐 [ROLES] Verificando status da autenticação...');
    console.log('📋 [ROLES] User:', user?.id);
    console.log('📋 [ROLES] Session:', !!session);
    console.log('📋 [ROLES] IsAdmin:', isAdmin);
    
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    console.log('📋 [ROLES] Current session valid:', !!currentSession);
    
    if (!currentSession) {
      console.error('❌ [ROLES] Sem sessão ativa! Usuário precisa fazer login novamente.');
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      return false;
    }
    
    if (!isAdmin) {
      console.error('❌ [ROLES] Usuário não é admin:', { userId: user?.id, isAdmin });
      toast.error('Você não tem permissão para gerenciar papéis.');
      return false;
    }
    
    return true;
  };

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
      
      // Verificar autenticação antes de tentar criar
      const authValid = await checkAuthStatus();
      if (!authValid) {
        return;
      }
      
      console.log('🔄 [ROLES] Tentando criar role:', roleData);
      console.log('🔐 [ROLES] Usando caminho seguro (RPC) para evitar erros de log...');
      const result = await createRoleSecure(roleData);
      return result;
    } catch (error: any) {
      console.error('❌ [ROLES] Erro ao criar papel:', error);
      
      // Tentar interpretar mensagens de erro específicas
      let errorMessage = 'Erro ao criar papel';
      if (error?.message?.includes('auth')) {
        errorMessage = 'Erro de autenticação. Faça login novamente.';
      } else if (error?.message?.includes('permission')) {
        errorMessage = 'Você não tem permissão para esta operação.';
      } else if (error?.message?.includes('duplicate') || error?.code === '23505') {
        errorMessage = 'Já existe um papel com este nome.';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const createRoleSecure = async (roleData: CreateRoleData) => {
    try {
      console.log('🔐 [ROLES] Criando role via RPC segura:', roleData);
      
      // Verificar se temos uma sessão válida antes do RPC
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        console.error('❌ [ROLES] Sem sessão para RPC!');
        toast.error('Sessão expirada. Recarregue a página e tente novamente.');
        throw new Error('Sessão expirada');
      }
      
      console.log('🔐 [ROLES] Sessão válida, chamando RPC...');
      const { data, error } = await supabase.rpc('secure_create_role_safe', {
        p_name: roleData.name,
        p_description: roleData.description || null,
        p_is_system: roleData.is_system || false
      });

      if (error) {
        console.error('❌ [ROLES] Erro na função RPC:', error);
        
        // Interpretar erros específicos da RPC
        if (error.message?.includes('Acesso negado')) {
          toast.error('Você não tem permissão de administrador. Verifique seu login.');
        } else if (error.message?.includes('já existe')) {
          toast.error('Já existe um papel com este nome.');
        } else {
          toast.error(`Erro na função RPC: ${error.message}`);
        }
        
        throw error;
      }

      if (!data?.success) {
        console.error('❌ [ROLES] RPC retornou erro:', data);
        const errorMsg = data?.error || 'Erro desconhecido na criação do role';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ [ROLES] Role criado via RPC:', data);
      
      // Recarregar a lista de roles para garantir consistência
      await fetchRoles();
      toast.success(data.message || 'Papel criado com sucesso');
      
      return data;
    } catch (error: any) {
      console.error('❌ [ROLES] Erro na função RPC segura:', error);
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
