
import { useState, useEffect } from 'react';
import { supabase, UserProfile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Role } from '@/hooks/admin/useRoles';

export const useUsers = () => {
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*, user_roles(*)")
        .order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setUsers(data as UserProfile[]);
    } catch (error: any) {
      console.error("Erro ao buscar usuários:", error.message);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setAvailableRoles(data as Role[]);
    } catch (error: any) {
      console.error("Erro ao buscar papéis:", error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  return {
    users,
    availableRoles,
    loading,
    searchQuery,
    setSearchQuery,
    fetchUsers,
    selectedUser,
    setSelectedUser,
    canManageUsers: hasPermission('users.manage'),
    canAssignRoles: hasPermission('users.roles.assign'),
  };
};
