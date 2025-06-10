
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile, getUserRoleName } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { usePermissions, Role } from '@/hooks/auth/usePermissions';

export function useUsers() {
  const { user, isAdmin } = useAuth();
  const { hasPermission } = usePermissions();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Verificações de permissão
  const canManageUsers = isAdmin || hasPermission('users.manage');
  const canAssignRoles = isAdmin || hasPermission('roles.assign');
  const canDeleteUsers = isAdmin || hasPermission('users.delete');
  const canResetPasswords = isAdmin || hasPermission('users.reset_password');

  const fetchUsers = useCallback(async () => {
    if (!canManageUsers) {
      console.warn('Usuário não tem permissão para gerenciar usuários');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Query com join para user_roles
      let query = supabase
        .from('profiles')
        .select(`
          id,
          email,
          name,
          avatar_url,
          company_name,
          industry,
          created_at,
          role_id,
          user_roles:role_id (
            id,
            name,
            description,
            permissions,
            is_system
          )
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtro de busca se houver
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Mapear dados para o formato UserProfile
      const mappedUsers: UserProfile[] = (data || []).map(user => ({
        id: user.id,
        email: user.email || '',
        name: user.name,
        avatar_url: user.avatar_url,
        company_name: user.company_name,
        industry: user.industry,
        created_at: user.created_at,
        role_id: user.role_id,
        user_roles: user.user_roles as any,
        onboarding_completed: false,
        onboarding_completed_at: null
      }));

      setUsers(mappedUsers);

      console.log(`Carregados ${mappedUsers.length} usuários com filtro: "${searchQuery}"`);

    } catch (err: any) {
      console.error('Erro ao buscar usuários:', err);
      setError(err);
      toast.error('Erro ao carregar usuários', {
        description: err.message || 'Não foi possível carregar a lista de usuários.'
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [canManageUsers, searchQuery]);

  const fetchAvailableRoles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name');

      if (error) throw error;

      setAvailableRoles(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar roles disponíveis:', err);
      toast.error('Erro ao carregar roles', {
        description: err.message || 'Não foi possível carregar as roles disponíveis.'
      });
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (canManageUsers) {
        fetchUsers();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchUsers, canManageUsers]);

  // Carregar roles disponíveis
  useEffect(() => {
    if (canAssignRoles) {
      fetchAvailableRoles();
    }
  }, [canAssignRoles, fetchAvailableRoles]);

  // Função para refresh manual
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    availableRoles,
    loading,
    isRefreshing,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    fetchUsers: handleRefresh,
    canManageUsers,
    canAssignRoles,
    canDeleteUsers,
    canResetPasswords,
    error
  };
}
