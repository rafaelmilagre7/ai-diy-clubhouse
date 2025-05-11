
import { useState } from "react";
import { useUsers } from "@/hooks/admin/useUsers";
import { UsersHeader } from "@/components/admin/users/UsersHeader";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { UserRoleManager } from "@/components/admin/users/UserRoleManager";
import { UserProfile } from "@/lib/supabase";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DeleteUserDialog } from "@/components/admin/users/DeleteUserDialog";
import { ResetPasswordDialog } from "@/components/admin/users/ResetPasswordDialog";

const AdminUsers = () => {
  const {
    users,
    availableRoles,
    loading,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    fetchUsers,
    canManageUsers,
    canAssignRoles,
    canDeleteUsers,
    canResetPasswords,
  } = useUsers();

  const [roleManagerOpen, setRoleManagerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);

  const handleEditRole = (user: UserProfile) => {
    setSelectedUser(user);
    setRoleManagerOpen(true);
  };

  const handleDeleteUser = (user: UserProfile) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleResetPassword = (user: UserProfile) => {
    setSelectedUser(user);
    setResetPasswordDialogOpen(true);
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
        />
        
        <div className="border rounded-lg">
          <UsersTable
            users={users}
            loading={loading}
            canEditRoles={canAssignRoles}
            canDeleteUsers={canDeleteUsers}
            canResetPasswords={canResetPasswords}
            onEditRole={handleEditRole}
            onDeleteUser={handleDeleteUser}
            onResetPassword={handleResetPassword}
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
        
        {canDeleteUsers && (
          <DeleteUserDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            user={selectedUser}
            onSuccess={fetchUsers}
          />
        )}
        
        {canResetPasswords && (
          <ResetPasswordDialog
            open={resetPasswordDialogOpen}
            onOpenChange={setResetPasswordDialogOpen}
            user={selectedUser}
          />
        )}
      </div>
    </PermissionGuard>
  );
};

export default AdminUsers;
