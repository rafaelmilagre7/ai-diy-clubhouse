
import { useState, useEffect } from 'react';
import { supabase, UserProfile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useAuth } from '@/contexts/auth';
import { toast as sonnerToast } from 'sonner';

export type Role = {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions: Record<string, any>;
};

export const useUsers = () => {
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [newRoleId, setNewRoleId] = useState<string>("");
  const [saving, setSaving] = useState(false);

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

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRoleId) {
      setEditRoleOpen(false);
      return;
    }
    
    try {
      setSaving(true);
      
      // Registrar a ação no log de auditoria
      await supabase.rpc('log_permission_change', {
        user_id: user?.id,
        action_type: 'assign_role',
        target_user_id: selectedUser.id,
        role_id: newRoleId
      });
      
      // Atualizar o papel do usuário
      const { error } = await supabase
        .from("profiles")
        .update({ role_id: newRoleId })
        .eq("id", selectedUser.id);
      
      if (error) throw error;
      
      // Atualizar o estado local
      setUsers(prevUsers => 
        prevUsers.map(u => {
          if (u.id === selectedUser.id) {
            const selectedRole = availableRoles.find(role => role.id === newRoleId);
            return { 
              ...u, 
              role_id: newRoleId,
              role: selectedRole?.name as any // Manter compatibilidade com o campo antigo
            };
          }
          return u;
        })
      );
      
      sonnerToast.success(`Papel do usuário ${selectedUser.name || selectedUser.email} atualizado com sucesso.`);
    } catch (error: any) {
      console.error("Erro ao atualizar papel:", error.message);
      sonnerToast.error(
        "Erro ao atualizar papel",
        { description: error.message || "Não foi possível atualizar a função do usuário." }
      );
    } finally {
      setSaving(false);
      setEditRoleOpen(false);
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
    editRoleOpen,
    setEditRoleOpen,
    newRoleId,
    setNewRoleId,
    saving,
    handleUpdateRole,
    canManageUsers: hasPermission('users.manage'),
    canAssignRoles: hasPermission('users.roles.assign'),
  };
};
