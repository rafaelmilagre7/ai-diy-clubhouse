
import { useState, useEffect } from 'react';
import { supabase, UserProfile } from '@/lib/supabase';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Role } from '@/hooks/admin/useRoles';
import { toast } from "sonner";

export const useUsers = () => {
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
      toast.error("Não foi possível carregar a lista de usuários.");
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
      toast.error("Erro ao carregar papéis de usuário");
    }
  };

  useEffect(() => {
    // Fetch data when component mounts
    fetchUsers();
    fetchRoles();
  }, []);

  return {
    users,
    availableRoles,
    loading,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    fetchUsers,
    canManageUsers: hasPermission('users.manage'),
    canAssignRoles: hasPermission('users.roles.assign'),
    canDeleteUsers: hasPermission('users.delete'),
    canResetPasswords: hasPermission('users.reset_password'),
  };
};
