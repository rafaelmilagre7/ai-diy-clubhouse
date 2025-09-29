
import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile, getUserRoleName } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { usePermissions, Role } from '@/hooks/auth/usePermissions';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';

interface UserStats {
  total_users: number;
  masters: number;
  team_members: number;
  organizations: number;
  individual_users: number;
  active_users?: number;
  inactive_users?: number;
  onboarding_completed?: number;
  onboarding_pending?: number;
  new_users_7d?: number;
  new_users_30d?: number;
  top_roles?: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

interface PaginatedUsersResponse {
  users: UserProfile[];
  totalUsers: number;
}

export function useUsers() {
  const { user, isAdmin } = useAuth();
  const { hasPermission } = usePermissions();
  const { setLoading } = useGlobalLoading();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total_users: 0,
    masters: 0,
    team_members: 0,
    organizations: 0,
    individual_users: 0
  });
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLocalLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  // Novos filtros avançados
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [onboardingFilter, setOnboardingFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize] = useState(50);
  
  // Cache e refs para evitar loops
  const lastSearchQuery = useRef<string>('');
  const fetchInProgress = useRef(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Verificações de permissão (memoizadas)
  const canManageUsers = isAdmin || hasPermission('users.manage');
  const canAssignRoles = isAdmin || hasPermission('roles.assign');
  const canDeleteUsers = isAdmin || hasPermission('users.delete');
  const canResetPasswords = isAdmin || hasPermission('users.reset_password');

  // Buscar estatísticas otimizadas com dados avançados
  const fetchStats = useCallback(async () => {
    if (!canManageUsers) return;
    
    try {
      const { data, error } = await supabase.rpc('get_enhanced_user_stats_public');
      
      if (error) {
        console.error('[USERS] Erro ao buscar estatísticas:', error);
        return;
      }
      
      if (data && typeof data === 'object' && !data.error) {
        setStats(data as UserStats);
        console.log('[STATS] ✅ Estatísticas avançadas carregadas:', data);
      }
    } catch (err: any) {
      console.error('[USERS] Erro ao buscar estatísticas:', err);
    }
  }, [canManageUsers]);

  // Função de busca paginada otimizada
  const fetchUsers = useCallback(async (forceRefresh = false, page = currentPage) => {
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
        fetchUsers(true, 1); // Reset para primeira página na busca
      }, 300);
      return;
    }

    console.log(`[USERS] Iniciando busca paginada: "${searchQuery}", página ${page}`);
    fetchInProgress.current = true;
    setLocalLoading(true);
    setLoading('data', true);
    setError(null);
    
    try {
      const offset = (page - 1) * pageSize;
      
      // Chamar função SQL otimizada com filtros avançados
      const { data, error: queryError } = await supabase.rpc('get_users_with_advanced_filters_public', {
        p_limit: pageSize,
        p_offset: offset,
        p_search: searchQuery.trim() || null,
        p_user_type: filterType === 'all' ? null : filterType,
        p_organization_id: organizationFilter === 'all' ? null : organizationFilter,
        p_role_id: roleFilter === 'all' ? null : roleFilter,
        p_status: statusFilter === 'all' ? null : statusFilter,
        p_onboarding: onboardingFilter === 'all' ? null : onboardingFilter,
        p_date_filter: dateFilter === 'all' ? null : dateFilter
      });

      if (queryError) {
        throw new Error(`Erro ao buscar usuários: ${queryError.message}`);
      }

      if (data && data.length > 0) {
        const totalCount = data[0]?.total_count || 0;
        setTotalUsers(totalCount);
        
        const mappedUsers: UserProfile[] = data.map((user: any) => ({
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
          user_roles: user.user_roles,
          organization: user.organization
        }));

        setUsers(mappedUsers);
        setCurrentPage(page);
        console.log(`[USERS] ✅ ${mappedUsers.length} usuários carregados (página ${page}/${Math.ceil(totalCount / pageSize)})`);
      } else {
        setUsers([]);
        setTotalUsers(0);
        setCurrentPage(1);
      }
      
      // Buscar estatísticas se for refresh completo
      if (forceRefresh || page === 1) {
        await fetchStats();
      }
      
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
  }, [canManageUsers, searchQuery, filterType, organizationFilter, roleFilter, statusFilter, onboardingFilter, dateFilter, currentPage, pageSize, setLoading, fetchStats]);

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
      fetchUsers(true, 1);
    }
  }, [canManageUsers]);

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
    fetchUsers(true, currentPage);
  }, [fetchUsers, currentPage]);

  // Update search query sem trigger automático
  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset para primeira página
    fetchUsers(false, 1);
  }, [fetchUsers]);

  // Handlers para filtros
  const updateFilterType = useCallback((type: string) => {
    setFilterType(type);
    setCurrentPage(1);
    fetchUsers(true, 1);
  }, [fetchUsers]);

  const updateOrganizationFilter = useCallback((orgId: string) => {
    setOrganizationFilter(orgId);
    setCurrentPage(1);
    fetchUsers(true, 1);
  }, [fetchUsers]);

  // Novos handlers para filtros avançados
  const updateRoleFilter = useCallback((roleId: string) => {
    setRoleFilter(roleId);
    setCurrentPage(1);
    fetchUsers(true, 1);
  }, [fetchUsers]);

  const updateStatusFilter = useCallback((status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchUsers(true, 1);
  }, [fetchUsers]);

  const updateOnboardingFilter = useCallback((onboarding: string) => {
    setOnboardingFilter(onboarding);
    setCurrentPage(1);
    fetchUsers(true, 1);
  }, [fetchUsers]);

  const updateDateFilter = useCallback((dateRange: string) => {
    setDateFilter(dateRange);
    setCurrentPage(1);
    fetchUsers(true, 1);
  }, [fetchUsers]);

  // Navegação de páginas
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= Math.ceil(totalUsers / pageSize)) {
      fetchUsers(false, page);
    }
  }, [fetchUsers, totalUsers, pageSize]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [goToPage, currentPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [goToPage, currentPage]);

  return {
    users,
    stats,
    availableRoles,
    loading,
    isRefreshing,
    searchQuery,
    setSearchQuery: updateSearchQuery,
    filterType,
    setFilterType: updateFilterType,
    organizationFilter,
    setOrganizationFilter: updateOrganizationFilter,
    // Novos filtros avançados
    roleFilter,
    setRoleFilter: updateRoleFilter,
    statusFilter,
    setStatusFilter: updateStatusFilter,
    onboardingFilter,
    setOnboardingFilter: updateOnboardingFilter,
    dateFilter,
    setDateFilter: updateDateFilter,
    selectedUser,
    setSelectedUser,
    fetchUsers: handleRefresh,
    // Paginação
    currentPage,
    totalUsers,
    pageSize,
    totalPages: Math.ceil(totalUsers / pageSize),
    goToPage,
    nextPage,
    prevPage,
    canGoNext: currentPage < Math.ceil(totalUsers / pageSize),
    canGoPrev: currentPage > 1,
    // Permissões
    canManageUsers,
    canAssignRoles,
    canDeleteUsers,
    canResetPasswords,
    error
  };
}
