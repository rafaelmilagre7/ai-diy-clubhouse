
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useRoles } from './useRoles';

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const { user } = useAuth();
  const { roles: availableRoles, loading: rolesLoading } = useRoles();

  // Criar usuário de teste automaticamente (apenas para desenvolvimento)
  const createTestUser = async () => {
    const testUser: UserProfile = {
      id: 'test-user-id',
      email: 'teste@exemplo.com',
      name: 'Usuário de Teste',
      role: 'membro_club',
      avatar_url: null,
      company_name: 'Empresa Teste',
      industry: 'Tecnologia',
      created_at: new Date().toISOString(),
    };
    
    return testUser;
  };

  const fetchUsers = async () => {
    try {
      setError(null);
      
      console.log('🔍 Buscando usuários...');
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          name,
          role,
          role_id,
          avatar_url,
          company_name,
          industry,
          created_at,
          user_roles (
            id,
            name,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('❌ Erro ao buscar profiles:', profilesError);
        throw profilesError;
      }

      console.log('✅ Profiles encontrados:', profiles?.length || 0);

      if (!profiles || profiles.length === 0) {
        console.log('🔧 Nenhum usuário encontrado, criando usuário de teste...');
        const testUser = await createTestUser();
        setUsers([testUser]);
        return;
      }

      // Mapear os dados para o formato esperado
      const mappedUsers: UserProfile[] = profiles.map(profile => ({
        id: profile.id,
        email: profile.email || '',
        name: profile.name,
        role: profile.role || 'membro_club',
        role_id: profile.role_id,
        user_roles: profile.user_roles,
        avatar_url: profile.avatar_url,
        company_name: profile.company_name,
        industry: profile.industry,
        created_at: profile.created_at || new Date().toISOString(),
      }));

      console.log('📊 Usuários mapeados:', {
        total: mappedUsers.length,
        byRole: mappedUsers.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });

      setUsers(mappedUsers);

    } catch (error: any) {
      console.error('❌ Erro geral ao buscar usuários:', error);
      setError(error);
      
      // Em caso de erro, mostrar pelo menos um usuário de teste
      const testUser = await createTestUser();
      setUsers([testUser]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrar usuários baseado na busca
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.company_name?.toLowerCase().includes(query) ||
      user.industry?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Verificar permissões baseadas no papel do usuário
  const isAdmin = user?.email === 'rafael@viverdeia.ai' || user?.email === 'admin@teste.com' || user?.email === 'admin@viverdeia.ai';
  const canManageUsers = isAdmin;
  const canAssignRoles = isAdmin;
  const canDeleteUsers = isAdmin;
  const canResetPasswords = isAdmin;

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUsers();
  };

  return {
    users: filteredUsers,
    availableRoles,
    loading: loading || rolesLoading,
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
};
