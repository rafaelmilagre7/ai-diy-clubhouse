
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

  // Permissões básicas - podem ser expandidas conforme necessário
  const canManageUsers = true;
  const canAssignRoles = true;
  const canDeleteUsers = true;
  const canResetPasswords = true;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_users_with_roles', {
        limit_count: 100,
        offset_count: 0,
        search_query: searchQuery || null
      });

      if (error) throw error;

      setUsers((data as any) || []);
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
