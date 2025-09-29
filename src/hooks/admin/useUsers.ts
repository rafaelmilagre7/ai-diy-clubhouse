
import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile, getUserRoleName } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { usePermissions, Role } from '@/hooks/auth/usePermissions';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';

export function useUsers() {
  const { user, isAdmin } = useAuth();
  const { hasPermission } = usePermissions();
  const { setLoading } = useGlobalLoading();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLocalLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Cache e refs para evitar loops
  const lastSearchQuery = useRef<string>('');
  const fetchInProgress = useRef(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Verificações de permissão (memoizadas)
  const canManageUsers = isAdmin || hasPermission('users.manage');
  const canAssignRoles = isAdmin || hasPermission('roles.assign');
  const canDeleteUsers = isAdmin || hasPermission('users.delete');
  const canResetPasswords = isAdmin || hasPermission('users.reset_password');

  // Função de busca otimizada com debounce interno
  const fetchUsers = useCallback(async (forceRefresh = false) => {
    if (!canManageUsers || (fetchInProgress.current && !forceRefresh)) {
      console.warn('[USERS] Busca cancelada - sem permissão ou em progresso');
      return;
    }

    // Debounce interno para busca
    if (searchQuery !== lastSearchQuery.current && !forceRefresh) {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      fetchTimeoutRef.current = setTimeout(() => {
        lastSearchQuery.current = searchQuery;
        fetchUsers(true);
      }, 300);
      return;
    }

    console.log(`[USERS] Iniciando busca: "${searchQuery}"`);
    fetchInProgress.current = true;
    setLocalLoading(true);
    setLoading('data', true);
    setError(null);
    
    try {
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
          onboarding_completed,
          is_master_user,
          organization_id,
          user_roles:role_id (
            id,
            name,
            description,
            permissions,
            is_system
          ),
          organization:organization_id (
            id,
            name,
            master_user_id
          )
        `)
        .order('is_master_user', { ascending: false })
        .order('created_at', { ascending: false });

      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw new Error(`Erro ao buscar usuários: ${queryError.message}`);
      }

      const mappedUsers: UserProfile[] = (data || []).map(user => ({
        id: user.id,
        email: user.email || '',
        name: user.name,
        avatar_url: user.avatar_url,
        company_name: user.company_name,
        industry: user.industry,
        created_at: user.created_at,
        role_id: user.role_id,
        onboarding_completed: user.onboarding_completed,
        is_master_user: user.is_master_user,
        organization_id: user.organization_id,
        user_roles: user.user_roles as any,
        organization: user.organization as any
      }));

      setUsers(mappedUsers);
      console.log(`[USERS] ✅ ${mappedUsers.length} usuários carregados`);
      
    } catch (err: any) {
      console.error('[USERS] Erro ao buscar usuários:', err);
      setError(err);
      
      toast.error('Erro ao carregar usuários', {
        description: err.message || 'Não foi possível carregar a lista de usuários.',
      });
    } finally {
      fetchInProgress.current = false;
      setLocalLoading(false);
      setLoading('data', false);
      setIsRefreshing(false);
    }
  }, [canManageUsers, searchQuery, setLoading]);

  const fetchAvailableRoles = useCallback(async () => {
    if (!canAssignRoles) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name');

      if (error) {
        throw new Error(`Erro ao buscar roles: ${error.message}`);
      }

      setAvailableRoles(data || []);
      console.log(`[USERS] ✅ ${data?.length || 0} roles carregadas`);
      
    } catch (err: any) {
      console.error('[USERS] Erro ao buscar roles:', err);
      toast.error('Erro ao carregar roles', {
        description: err.message
      });
    }
  }, [canAssignRoles]);

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    if (canManageUsers) {
      console.log('[USERS] Carregamento inicial');
      fetchUsers(true);
    }
  }, [canManageUsers]); // Apenas esta dependência

  // Carregar roles disponíveis
  useEffect(() => {
    if (canAssignRoles) {
      fetchAvailableRoles();
    }
  }, [canAssignRoles, fetchAvailableRoles]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // Função para refresh manual
  const handleRefresh = useCallback(() => {
    console.log('[USERS] Refresh manual');
    setIsRefreshing(true);
    fetchUsers(true);
  }, [fetchUsers]);

  // Update search query sem trigger automático
  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    // O debounce acontece dentro do fetchUsers
    fetchUsers(false);
  }, [fetchUsers]);

  return {
    users,
    availableRoles,
    loading,
    isRefreshing,
    searchQuery,
    setSearchQuery: updateSearchQuery,
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
