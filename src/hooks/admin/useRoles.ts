
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/auth/usePermissions";

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions: Record<string, any>;
}

interface CreateRoleData {
  name: string;
  description: string;
  is_system: boolean;
}

interface UpdateRoleData {
  name?: string;
  description?: string;
}

export function useRoles() {
  const { hasPermission } = usePermissions();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      
      setRoles(data as Role[]);
    } catch (err: any) {
      console.error("Erro ao buscar papéis:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const createRole = async (roleData: CreateRoleData) => {
    try {
      setIsCreating(true);
      
      const { data, error } = await supabase
        .from("user_roles")
        .insert([roleData])
        .select()
        .single();
      
      if (error) throw error;
      
      setRoles((prevRoles) => [...prevRoles, data as Role]);
      toast.success("Papel criado com sucesso");
      return data;
    } catch (err: any) {
      console.error("Erro ao criar papel:", err);
      toast.error("Erro ao criar papel", {
        description: err.message || "Tente novamente mais tarde",
      });
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const updateRole = async (roleId: string, roleData: UpdateRoleData) => {
    try {
      setIsUpdating(true);
      
      const { data, error } = await supabase
        .from("user_roles")
        .update(roleData)
        .eq("id", roleId)
        .select()
        .single();
      
      if (error) throw error;
      
      setRoles((prevRoles) =>
        prevRoles.map((role) => (role.id === roleId ? data as Role : role))
      );
      
      toast.success("Papel atualizado com sucesso");
      return data;
    } catch (err: any) {
      console.error("Erro ao atualizar papel:", err);
      toast.error("Erro ao atualizar papel", {
        description: err.message || "Tente novamente mais tarde",
      });
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      setIsDeleting(true);
      
      // Verificar se há usuários com este papel
      const { data: users, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("role_id", roleId)
        .limit(1);
      
      if (userError) throw userError;
      
      if (users && users.length > 0) {
        toast.error("Não é possível excluir este papel", {
          description: "Existem usuários atribuídos a este papel.",
        });
        return false;
      }
      
      // Excluir o papel
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);
      
      if (error) throw error;
      
      setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleId));
      toast.success("Papel excluído com sucesso");
      return true;
    } catch (err: any) {
      console.error("Erro ao excluir papel:", err);
      toast.error("Erro ao excluir papel", {
        description: err.message || "Tente novamente mais tarde",
      });
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  // Permissões
  const assignPermissionToRole = async (roleId: string, permissionId: string) => {
    try {
      const { data, error } = await supabase.rpc("assign_permission_to_role", {
        role_id: roleId,
        permission_id: permissionId,
      });

      if (error) throw error;
      
      toast.success("Permissão atribuída com sucesso");
      return data;
    } catch (err: any) {
      console.error("Erro ao atribuir permissão:", err);
      toast.error("Erro ao atribuir permissão", {
        description: err.message || "Tente novamente mais tarde",
      });
      throw err;
    }
  };

  const removePermissionFromRole = async (roleId: string, permissionId: string) => {
    try {
      const { data, error } = await supabase.rpc("remove_permission_from_role", {
        role_id: roleId,
        permission_id: permissionId,
      });

      if (error) throw error;
      
      toast.success("Permissão removida com sucesso");
      return data;
    } catch (err: any) {
      console.error("Erro ao remover permissão:", err);
      toast.error("Erro ao remover permissão", {
        description: err.message || "Tente novamente mais tarde",
      });
      throw err;
    }
  };

  return {
    roles,
    isLoading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    isCreating,
    isUpdating,
    isDeleting,
    createDialogOpen,
    setCreateDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedRole,
    setSelectedRole,
    assignPermissionToRole,
    removePermissionFromRole,
    canManageRoles: hasPermission("roles.manage"),
    canViewRoles: hasPermission("roles.view"),
    canManagePermissions: hasPermission("permissions.manage"),
  };
}
