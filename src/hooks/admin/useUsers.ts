
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name: string | null;
  company_name: string | null;
  role: string | null;
  role_id: string | null;
  user_roles: {
    id: string;
    name: string;
    description: string;
  } | null;
  created_at: string;
}

export const useUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

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
          company_name,
          role,
          role_id,
          created_at,
          user_roles (
            id,
            name,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersData: User[] = (data || []).map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        company_name: user.company_name,
        role: user.role,
        role_id: user.role_id,
        user_roles: user.user_roles && !Array.isArray(user.user_roles) ? {
          id: user.user_roles.id,
          name: user.user_roles.name,
          description: user.user_roles.description
        } : null,
        created_at: user.created_at
      }));

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
    searchUsers,
    fetchUsers: () => fetchUsers(true)
  };
};
