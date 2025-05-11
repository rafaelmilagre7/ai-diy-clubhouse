
import { useEffect, useState } from "react";
import { useUsers } from "@/hooks/admin/useUsers";
import { UsersHeader } from "@/components/admin/users/UsersHeader";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { UserRoleManager } from "@/components/admin/users/UserRoleManager";
import { UserProfile } from "@/lib/supabase";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const AdminUsers = () => {
  const {
    users,
    availableRoles,
    loading,
    searchQuery,
    setSearchQuery,
    fetchUsers,
    selectedUser,
    setSelectedUser,
    canManageUsers,
    canAssignRoles,
  } = useUsers();

  const [roleManagerOpen, setRoleManagerOpen] = useState(false);

  useEffect(() => {
    // Recarregar usuários quando a página for montada
    fetchUsers();
  }, [fetchUsers]);

  const handleEditRole = (user: UserProfile) => {
    setSelectedUser(user);
    setRoleManagerOpen(true);
  };

  return (
    <PermissionGuard
      permission="users.view"
      fallback={
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso restrito</AlertTitle>
          <AlertDescription>
            Você não tem permissão para visualizar a lista de usuários.
          </AlertDescription>
        </Alert>
      }
    >
      <div className="space-y-6">
        <UsersHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={fetchUsers}
          loading={loading}
        />
        
        <div className="border rounded-lg">
          <UsersTable
            users={users}
            loading={loading}
            canEditRoles={canAssignRoles}
            onEditRole={handleEditRole}
          />
        </div>
        
        {canAssignRoles && (
          <UserRoleManager
            open={roleManagerOpen}
            onOpenChange={setRoleManagerOpen}
            user={selectedUser}
            availableRoles={availableRoles}
          />
        )}
      </div>
    </PermissionGuard>
  );
};

export default AdminUsers;
