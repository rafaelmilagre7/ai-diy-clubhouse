
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
  onboarding_completed?: number;
  onboarding_pending?: number;
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
    masters: 0
  });
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLocalLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado para controlar visualização - agora inicia com true para carregar automaticamente
  const [showUsers, setShowUsers] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  
  // Filtros simplificados (removidos obsoletos)
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

  // Buscar estatísticas corrigidas
  const fetchStats = useCallback(async () => {
    if (!canManageUsers) return;
    
    try {
      const { data, error } = await supabase.rpc('get_user_stats_corrected');
      
      if (error) {
        console.error('[USERS] Erro ao buscar estatísticas:', error);
        return;
      }
      
      if (data && typeof data === 'object' && !data.error) {
        setStats(data as UserStats);
        console.log('[STATS] ✅ Estatísticas corrigidas carregadas:', data);
      }
    } catch (err: any) {
      console.error('[USERS] Erro ao buscar estatísticas:', err);
    }
  }, [canManageUsers]);

  // Função de busca paginada otimizada
  const fetchUsers = useCallback(async (forceRefresh = false, page = currentPage, filterType?: string) => {
    // ✅ CORREÇÃO: forceRefresh tem prioridade ABSOLUTA
    if (!canManageUsers) {
      console.warn('[USERS] Busca cancelada - sem permissão');
      return;
    }
    
    // Se há busca em progresso MAS é forceRefresh, PERMITIR (override)
    if (fetchInProgress.current && forceRefresh) {
      console.warn('[USERS] ⚠️ Forçando refresh sobrescrevendo busca em progresso');
      fetchInProgress.current = false; // Resetar flag para permitir
    }
    
    // Apenas cancelar se NÃO for forceRefresh
    if (fetchInProgress.current && !forceRefresh) {
      console.warn('[USERS] Busca cancelada - busca em progresso (use forceRefresh=true)');
      return;
    }

    // Debounce interno para busca
    if (searchQuery !== lastSearchQuery.current && !forceRefresh) {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      fetchTimeoutRef.current = setTimeout(() => {
        lastSearchQuery.current = searchQuery;
        fetchUsers(true, 1, filterType); // Reset para primeira página na busca
      }, 300);
      return;
    }

    console.log(`[USERS] Iniciando busca paginada: "${searchQuery}", filtro: "${filterType || 'none'}", página ${page}`);
    fetchInProgress.current = true;
    setLocalLoading(true);
    setLoading('data', true);
    setError(null);
    
    try {
      const offset = (page - 1) * pageSize;
      
      // ✅ FASE 2: Chamar função SQL v2 com parâmetro correto
      const { data, error: queryError } = await supabase.rpc('get_users_with_filters_v2', {
        p_search_query: searchQuery.trim() || null,
        p_filter_type: filterType || 'all',
        p_limit: pageSize,
        p_offset: offset
      });

      if (queryError) {
        console.error('[USERS] ❌ Erro detalhado da RPC:', {
          message: queryError.message,
          code: queryError.code,
          details: queryError.details,
          hint: queryError.hint,
          parameters: {
            p_search_query: searchQuery.trim() || null,
            p_filter_type: filterType || 'all',
            p_limit: pageSize,
            p_offset: offset
          }
        });
        throw new Error(`Erro ao buscar usuários: ${queryError.message}`);
      }

      console.log('[USERS] ✅ RPC retornou dados brutos:', {
        length: data?.length || 0,
        firstUser: data?.[0] ? {
          id: data[0].id?.substring(0, 8) + '***',
          email: data[0].email,
          role: data[0].role,
          role_id: data[0].role_id?.substring(0, 8) + '***'
        } : null
      });

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
          master_email: user.master_email,
          user_roles: user.user_roles,
          organization: user.organization,
          member_count: user.member_count || 0
        }));

        setUsers(mappedUsers);
        setCurrentPage(page);
        console.log(`[USERS] ✅ ${mappedUsers.length} usuários carregados (página ${page}/${Math.ceil(totalCount / pageSize)})`);
      } else {
        setUsers([]);
        setTotalUsers(0);
        setCurrentPage(1);
      }
      
      // Marcar que usuários estão sendo exibidos
      setShowUsers(true);
      
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
  }, [canManageUsers, searchQuery, showUsers, currentPage, pageSize, setLoading, fetchStats]);

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

  // Carregar estatísticas e usuários automaticamente
  useEffect(() => {
    if (canManageUsers) {
      console.log('[USERS] Carregamento inicial - estatísticas e usuários');
      fetchStats();
      fetchUsers(true, 1, 'all'); // Carregar primeira página de todos os usuários
    }
  }, [canManageUsers, fetchStats]);

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
    console.log('[USERS] Refresh manual com filtro:', currentFilter);
    setIsRefreshing(true);
    fetchUsers(true, currentPage, currentFilter);
  }, [fetchUsers, currentPage, currentFilter]);

  // Handlers para Big Numbers clicáveis
  const handleFilterByType = useCallback((filterType: string) => {
    console.log(`[USERS] Filtro clicado: ${filterType}`);
    setCurrentFilter(filterType);
    setCurrentPage(1);
    setShowUsers(true); // Ativar exibição de usuários
    fetchUsers(true, 1, filterType);
  }, [fetchUsers]);

  // Update search query
  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    if (showUsers) {
      fetchUsers(false, 1, currentFilter);
    }
  }, [fetchUsers, showUsers, currentFilter]);

  // Limpar filtros e ocultar usuários
  const clearFilters = useCallback(() => {
    setShowUsers(false);
    setCurrentFilter('none');
    setUsers([]);
    setSearchQuery('');
    setCurrentPage(1);
    console.log('[USERS] Filtros limpos - usuários ocultos');
  }, []);

  // Navegação de páginas
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= Math.ceil(totalUsers / pageSize)) {
      fetchUsers(false, page, currentFilter);
    }
  }, [fetchUsers, totalUsers, pageSize, currentFilter]);

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
    selectedUser,
    setSelectedUser,
    fetchUsers: handleRefresh,
    // Estados de lazy loading
    showUsers,
    currentFilter,
    handleFilterByType,
    clearFilters,
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
