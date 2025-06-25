
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';

export const useUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);

  const fetchUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          name,
          avatar_url,
          company_name,
          industry,
          role,
          role_id,
          onboarding_completed,
          onboarding_completed_at,
          created_at,
          user_roles (
            id,
            name,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersData: UserProfile[] = (data || []).map(user => {
        // Type assertion para garantir que user_roles tem a estrutura correta
        const userRoles = user.user_roles as any;
        const userRolesData = userRoles && 
          typeof userRoles === 'object' && 
          !Array.isArray(userRoles) && 
          userRoles.id ? {
            id: userRoles.id as string,
            name: userRoles.name as string,
            description: userRoles.description as string
          } : null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          company_name: user.company_name,
          industry: user.industry,
          role: user.role,
          role_id: user.role_id,
          onboarding_completed: user.onboarding_completed || false,
          onboarding_completed_at: user.onboarding_completed_at,
          created_at: user.created_at,
          user_roles: userRolesData
        };
      });

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error.message);
      setError(error.message);
      toast({
        title: 'Erro ao carregar usuários',
        description: 'Não foi possível carregar a lista de usuários.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const searchUsers = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(query.toLowerCase()) ||
      user.user_roles?.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users: filteredUsers,
    loading,
    isRefreshing,
    error,
    searchQuery,
    setSearchQuery,
    searchUsers,
    fetchUsers: () => fetchUsers(true),
    // Propriedades adicionais que podem estar sendo esperadas
    availableRoles: [], // Placeholder - pode ser implementado depois
    selectedUser: null,
    setSelectedUser: () => {}, // Placeholder
    canManageUsers: true, // Placeholder - implementar lógica de permissões
    canAssignRoles: true, // Placeholder
    canDeleteUsers: true, // Placeholder
    canResetPasswords: true, // Placeholder
  };
};
