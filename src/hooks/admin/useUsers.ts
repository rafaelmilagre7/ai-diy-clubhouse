
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/lib/supabase";
import { Role } from "./useRoles";

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  role: string;
  role_id: string;
  user_roles: {
    id: string;
    name: string;
    description: string;
  } | null;
  company_name: string;
  industry: string;
  created_at: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const canManageUsers = true;
  const canAssignRoles = true;
  const canDeleteUsers = true;
  const canResetPasswords = true;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Como get_users_with_roles não existe, vamos buscar os dados diretamente
      let query = supabase
        .from('profiles')
        .select(`
          id,
          email,
          name,
          avatar_url,
          role,
          role_id,
          company_name,
          industry,
          created_at,
          user_roles!inner(
            id,
            name,
            description
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      // Aplicar filtro de busca se existir
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Mapear os dados para o formato esperado
      const mappedUsers: User[] = (data || []).map(profile => ({
        id: profile.id,
        email: profile.email || '',
        name: profile.name || '',
        avatar_url: profile.avatar_url || '',
        role: profile.role || '',
        role_id: profile.role_id || '',
        user_roles: profile.user_roles ? {
          id: (profile.user_roles as any).id,
          name: (profile.user_roles as any).name,
          description: (profile.user_roles as any).description
        } : null,
        company_name: profile.company_name || '',
        industry: profile.industry || '',
        created_at: profile.created_at
      }));

      setUsers(mappedUsers);
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      setError(error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Ocorreu um erro ao carregar a lista de usuários.",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, toast]);

  const fetchAvailableRoles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name');

      if (error) throw error;

      setAvailableRoles((data as any) || []);
    } catch (error: any) {
      console.error('Erro ao buscar papéis:', error);
      setAvailableRoles([]);
    }
  }, []);

  const searchUsers = (query: string) => {
    setSearchQuery(query);
  };

  const refreshUsers = () => {
    setIsRefreshing(true);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
    fetchAvailableRoles();
  }, [fetchUsers, fetchAvailableRoles]);

  return {
    users,
    availableRoles,
    loading,
    isRefreshing,
    searchQuery,
    selectedUser,
    error,
    canManageUsers,
    canAssignRoles,
    canDeleteUsers,
    canResetPasswords,
    setSearchQuery,
    setSelectedUser,
    fetchUsers: refreshUsers,
    searchUsers
  };
};
