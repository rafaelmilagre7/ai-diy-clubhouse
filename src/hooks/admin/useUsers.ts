
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
      console.warn('[USERS] Usuário não tem permissão para gerenciar usuários');
      return;
    }

    console.log(`[USERS] Iniciando busca de usuários com filtro: "${searchQuery}"`);
    setLoading(true);
    setError(null);
    
    // Timeout de segurança para garantir que loading sempre finalize
    const timeoutId = setTimeout(() => {
      console.warn('[USERS] Timeout de 10s - forçando fim do loading');
      setLoading(false);
      setIsRefreshing(false);
      toast.error('Timeout ao carregar usuários. Tente novamente.');
    }, 10000);

    try {
      // Query simplificada e direta
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

      console.log('[USERS] Executando query no Supabase...');
      const { data, error: queryError } = await query;

      clearTimeout(timeoutId);

      if (queryError) {
        console.error('[USERS] Erro na query:', queryError);
        throw new Error(`Erro ao buscar usuários: ${queryError.message}`);
      }

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
      console.log(`[USERS] ✅ ${mappedUsers.length} usuários carregados com sucesso`);
      
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('[USERS] Erro ao buscar usuários:', err);
      setError(err);
      
      toast.error('Erro ao carregar usuários', {
        description: err.message || 'Não foi possível carregar a lista de usuários.',
        action: {
          label: 'Tentar novamente',
          onClick: () => fetchUsers()
        }
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      console.log('[USERS] Busca finalizada - loading definido como false');
    }
  }, [canManageUsers, searchQuery]); // Apenas dependências essenciais

  const fetchAvailableRoles = useCallback(async () => {
    if (!canAssignRoles) return;

    try {
      console.log('[USERS] Buscando roles disponíveis');
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

  // Carregar usuários inicialmente e quando canManageUsers mudar
  useEffect(() => {
    if (canManageUsers) {
      console.log('[USERS] useEffect disparado - carregando usuários');
      fetchUsers();
    }
  }, [canManageUsers]); // Apenas esta dependência para evitar loops

  // Debounce search separado para evitar conflitos
  useEffect(() => {
    if (!canManageUsers) return;

    const timeoutId = setTimeout(() => {
      console.log(`[USERS] Debounce search: "${searchQuery}"`);
      fetchUsers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]); // Apenas searchQuery como dependência

  // Carregar roles disponíveis
  useEffect(() => {
    if (canAssignRoles) {
      fetchAvailableRoles();
    }
  }, [canAssignRoles, fetchAvailableRoles]);

  // Função para refresh manual
  const handleRefresh = useCallback(() => {
    console.log('[USERS] Refresh manual iniciado');
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
