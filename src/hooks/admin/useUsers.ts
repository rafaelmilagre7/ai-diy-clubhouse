
import { useState, useEffect } from 'react';
import { supabase, UserProfile } from '@/lib/supabase';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Role } from '@/hooks/admin/useRoles';
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

export const useUsers = () => {
  const { hasPermission } = usePermissions();
  const { user, isAdmin } = useAuth(); // Usar isAdmin diretamente do contexto de autenticação
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
  
  // Verificações alternativas de permissão caso o sistema de permissões falhe
  const isAdminByEmail = user?.email?.includes('@viverdeia.ai') || 
                         user?.email === 'admin@teste.com' || 
                         user?.email === 'admin@viverdeia.ai';

  return {
    users,
    availableRoles,
    loading,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    fetchUsers,
    // Usar fallback de permissões caso o sistema principal falhe
    canManageUsers: hasPermission('users.manage') || isAdmin || isAdminByEmail,
    canAssignRoles: hasPermission('users.roles.assign') || isAdmin || isAdminByEmail,
    canDeleteUsers: hasPermission('users.delete') || isAdmin || isAdminByEmail,
    canResetPasswords: hasPermission('users.reset_password') || isAdmin || isAdminByEmail,
  };
};
